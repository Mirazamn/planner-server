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


// Get day 
router.get('/:id', (req, res) => {
    fs.readFile(Path, 'utf8', (err, data) => {
        if (err) {
            console.log("Error reading file:", err);
            return res.status(500).send("Error reading file!")
        }
        const tasksData = JSON.parse(data)
        const filtered = tasksData.filter(d => d.date === req.params.id)
        res.json(filtered.length > 0 ? filtered[0].tasks : [])
    })
})

router.put('/', (req, res) => {
    const { date, tasks: updatedTasks } = req.body;

    fs.readFile(Path, 'utf8', (err, data) => {
        if (err) return res.status(500).send("Error reading file!");
        const tasksData = JSON.parse(data);
        const dayIndex = tasksData.findIndex(d => d.date === date);

        if (dayIndex !== -1) {
            tasksData[dayIndex].tasks = updatedTasks.map((t, idx) => ({
                ...t,
                id: (idx + 1).toString()
            }));
        } else {
            tasksData.push({
                date,
                tasks: updatedTasks.map((t, idx) => ({ ...t, id: (idx + 1).toString() }))
            });
        }

        fs.writeFile(Path, JSON.stringify(tasksData, null, 2), err => {
            if (err) return res.status(500).send("Error writing file!");
            res.json(updatedTasks);
        });
    });
});

/// Post task
router.post('/:id', (req, res) => {
    fs.readFile(Path, 'utf8', (err,data) => {
        if (err) {
            console.log("Error reading file:", err);
            return res.status(500).send("Error writing file!");
        }

        const tasks = JSON.parse(data);
        const today = req.params.id;
        const day = tasks.find(d => d.date === today);

        if (day) {
            // Shu sanaga yangi task qo‘shish
            const maxId = day.tasks.reduce((max, t) => Math.max(max, Number(t.id)), 0);
            const newTask = {
                title: req.body.title,
                status: req.body.status,
                id: (maxId + 1).toString()
            };
            day.tasks.push(newTask);
        } else {
            // Yangi sana qo‘shish
            tasks.push({
                date: today,
                tasks: [{
                    title: req.body.title,
                    status: req.body.status,
                    id: "1"
                }]
            });
        }

        fs.writeFile(Path, JSON.stringify(tasks, null, 2), (err) => {
            if (err) {
                console.log("Error writing file:", err);
                return res.status(500).send("Error writing file!");
            }
            res.json(tasks.find(d => d.date === today).tasks);
        });
    });
});

// Delete task
router.delete('/:date/:id', (req,res) => {
    fs.readFile(Path, 'utf8', (err,data) => {
        if (err) return res.status(500).send("Error reading file!");
        const tasksData = JSON.parse(data);

        const { date, id } = req.params;
        const dayIndex = tasksData.findIndex(d => d.date === date);

        if (dayIndex === -1) return res.status(404).send("Day not found");

        // Shu sananing tasks arrayini yangilash
        const updatedTasks = tasksData[dayIndex].tasks.filter(t => t.id !== id)
            .map((t, idx) => ({ ...t, id: (idx + 1).toString() }));

        tasksData[dayIndex].tasks = updatedTasks;

        fs.writeFile(Path, JSON.stringify(tasksData, null, 2), (err) => {
            if (err) return res.status(500).send("Error writing file!");
            res.json(updatedTasks);
        });
    });
});

app.use(express.json())
app.use(cors())
app.use('/', router)
app.listen(PORT, () => {
    console.log("Running on" + PORT);
})