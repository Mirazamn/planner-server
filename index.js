const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3333

const Path = 'Databases/tasks.json'
const fs = require('fs');
const { log } = require('console');
const router = express.Router();

// Get all tasks
router.get('/', (req,res) => {
    fs.readFile(Path, 'utf8', (err,data) => {
        if (err) {
            console.log("Error reading file:", err);
            return res.status(500).send("Error reading file!")
        }
        res.json(JSON.parse(data));
    })
})

// Update tasks
router.put('/', (req, res) => {
  const tasks = Array.isArray(req.body) ? req.body : Object.values(req.body);

  fs.writeFile(Path, JSON.stringify(tasks, null, 2), (err) => {
    if (err) {
      console.log("Error writing file:", err);
      return res.status(500).send("Error writing file!");
    }
    res.json(tasks);
  });
});

// Post task
router.post('/', (req, res) => {
    fs.readFile(Path, 'utf8', (err,data) => {
        if (err) {
            console.log("Error reading file:", err);
            return res.status(500).send("Error writing file!");
        }
        const tasks = JSON.parse(data);
        const UpdatedTasks = [...tasks, req.body];
        const IDordered = UpdatedTasks.map((t, index) => ({
            title: t.title,
            status: t.status,
            id: (index + 1).toString()
        }));

        fs.writeFile(Path, JSON.stringify(IDordered, null, 2), (err) => {
            if (err) {
                console.log("Error writing file:", err);
                return res.status(500).send("Error writing file!");
            }
            res.json(UpdatedTasks);
    })
})});

// Delete task
router.delete('/:id', (req,res) => {
    fs.readFile(Path, 'utf8', (err,data) => {
        if (err) {
            console.log("Error reading file:", err);
            return res.status(500).send("Error reading file!");
        }
        const tasks = JSON.parse(data);
        const taskId = req.params.id;
        const UpdatedTasks = tasks.filter(task => task.id !== taskId);
        const IDordered = UpdatedTasks.map((t, index) => ({
            title: t.title,
            status: t.status,
            id: (index + 1).toString()
        }));

        
        fs.writeFile(Path, JSON.stringify(IDordered, null, 2), (err) => {
            if (err) {
                console.log("Error writing file:", err);
                return res.status(500).send("Error writing file!");
            }
            res.json(UpdatedTasks);
        });
    })
})

app.use(express.json())
app.use(cors())
app.use('/', router)
app.listen(PORT, () => {
    console.log("Running on" + PORT);
})