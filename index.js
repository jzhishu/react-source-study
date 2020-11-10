import React from "./src/react";
import ReactDOM from "./src/react-dom"

/* 
    https://pomb.us/build-your-own-react/
*/

const container = document.getElementById("root")

const updateValue = e => {
    rerender(e.target.value)
}

const rerender = value => {
    const element = (
        <div>
            <input onInput={updateValue} value={value} />
            <h2>Hello {value}</h2>
        </div>
    )
    ReactDOM.render(element, container)
}

rerender("World")

