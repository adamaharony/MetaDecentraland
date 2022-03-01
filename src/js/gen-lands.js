const fs = require("fs")
const N = 20 // for N x N grid
let LANDS = []

// array of total indices

let coords = []
for (let i = 0; i < N; i++) {
    coords.push(i)
}

// defining 1st plaza
let centreIdx = Math.floor((N - 1) / 2)
let plazaRad = Math.floor(Math.random() * (5 - 2 + 1) + 2)
let plaza1 = []

for (let i = 0; i < N; i++)
    for (let j = 0; j < N; j++)
        if (Math.abs(i - centreIdx) + Math.abs(j - centreIdx) <= plazaRad) {
            plaza1.push([i, j])
            coords = coords.filter((val, idx, arr) => {
                return val !== i && val !== j
            })
        }
let plaza1X = []
let plaza1Y = []
for (let i = 0; i < plaza1.length; i++) {
    plaza1X.push(plaza1[i][0])
    plaza1Y.push(plaza1[i][1])
}


// defining roads
let roads = []
for (let i = 0; i < 2; i++) {
    idx = Math.floor(Math.random() * coords.length)
    roads.push(coords[idx])
}
coords = coords.filter((val, idx, arr) => {
    return !roads.includes(val)
})


// defining 2nd plaza
let plaza2 = []
let p2idx = Math.floor(Math.random() * coords.length)
let p2 = coords[p2idx]
plazaRad = Math.floor(Math.random() * (3 - 1 + 1) + 1)
for (let i = 0; i < N; i++)
    for (let j = 0; j < N; j++)
        if (Math.abs(i - p2idx) + Math.abs(j - p2idx) <= plazaRad) {
            plaza2.push([i, j])
            coords = coords.filter((val, idx, arr) => {
                return val !== i && val !== j
            })
        }
let plaza2X = []
let plaza2Y = []
for (let i = 0; i < plaza2.length; i++) {
    plaza2X.push(plaza2[i][0])
    plaza2Y.push(plaza2[i][1])
}


console.log(coords)
console.log(plaza1)
console.log(roads)




// Creating the grid
for (let i = 0; i < N; i++) {
    LANDS.push([])
    for (let j = 0; j < N; j++) {
        let land
        if (roads.includes(i) || roads.includes(j)) {
            land = {
                type: "Road", // "Land", "Road", "Park"
                coords: `(${i}; ${j})`,
                price: null
            }
        } else if ((plaza1X.includes(i) && plaza1Y.includes(j)) || (plaza2X.includes(i) && plaza2Y.includes(j))) {
            land = {
                type: "Park", // "Land", "Road", "Park"
                coords: `(${i}; ${j})`,
                price: null
            }
        } else {
            land = {
                type: "Land", // "Land", "Road", "Park"
                coords: `(${i}; ${j})`,
                price: Math.floor(Math.random() * (20 - 5 + 1)) + 5
            }
        }
        LANDS[i].push(land)
    }
}

fs.writeFileSync("src/lands.json", JSON.stringify(LANDS, null, 4))