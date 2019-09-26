const express =  require('express')
const axios = require('axios')
const redis = require('redis')

const PORT = process.env.PORT || 5000
const REDIS_PORT = process.env.PORT || 6379

const client = redis.createClient(REDIS_PORT)

const app = express()

// get data from github
const getProfile = async (req, res, next) => {
    try {
        console.log('Fetching Data..')
        const { username } = req.params
        const response = await axios.get(`https://api.github.com/users/${username}`)

        // set data to redis
        client.setex(username, 3600, JSON.stringify(response.data))

        res.send(response.data)
    } catch (err) {
        console.error(err)
        res.status(500)
    }
}

const cache = (req, res, next) => {
    const { username } = req.params
    client.get(username, (err, data) => {
        if (err) throw err
        if (data) {
            console.log('getting from cache')
            console.log(JSON.parse(data).public_repos)
            res.send(JSON.parse(data))
        } else {
            next()
        }
    })
}

app.get('/profile/:username', cache, getProfile)

app.listen(PORT, () => console.log(`App listening on ${PORT}`))