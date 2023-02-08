# Testing

![Autocannon result](https://i.postimg.cc/Wz4bxV57/autocannon.png)

# Installation

NodeJS **15.13.0**

1. `git clone https://github.com/AlexStinky/numbers_testovoe.git`
2. `npm install`
3. Edit env **PORT** and **DB_LIMIT** (for **Redis**) if you need
*default:*
*PORT=5000*
*DB_LIMIT=4000*
4. `npm run start`

# API

**IP:PORT**
*localhost:5000*

- get **/output?ticket=NUM**
Return **number_series** or **Try one more time later**

- get **/inprogress**
Return list of **number_series** whis is still on progress

- get **/add**
Add to **4000** new tickets

- get **/reset**
Reset **Redis DB**

- post **/input**
```js
body = {
    "number": NUM, //max 10000000000
    "type": NUM, // 1 - arithmetic progression, 2 - geometric progression, 3 - harmonic progression, 4 - fibonacci
    "data": {
        "start": NUM, // start num
        "common": NUM // common num
    }
}
```
Return **ticket** for **/output**