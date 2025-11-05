import { readFileSync } from "fs"
import { Err, Ok, Result, safeCall, wrap } from "./lib"
import { log } from "console"
import { readFile } from "fs/promises"

let file = safeCall(readFileSync, "test.txt") // <-- calls any function
let wrapperReadFile = wrap(readFile) // <-- wraps any function

// log(file.value) // <-- error, no value field in file yet
if (file.ok) log(file.value) // <-- here it exists
file.ok ? log(file.value) : log(file.error)
file.invert ?? log(file.value)

log(file.flat) // <-- has either value or error
file.log() // <-- logs the value of flat
file.log(0, 10) // <-- converts to string and clices
file.slice(0, 10) // <-- same but does not log

file.map((v) => String(v).toUpperCase()) // <-- maps the value to uppercase

function canFail() {
    // <-- returns Result<string>
    const shouldFail = Math.random() > 0.5
    if (shouldFail) return Err(new Error("Failed")) // <-- has call stack
    return Ok("Success")
}
canFail().ok

const wrapped = wrap(readFile) // <-- function wrapper
const res = await wrapped("test.txt") // <-- returns Result<Buffer>
res.flat // <-- has the value or error
