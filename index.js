import React from "./src/react";
import ReactDOM from "./src/react-dom"

let Ele = (
    <div className="relement" title="黑子">
        hello, <span>React</span>
    </div>
)

ReactDOM.render(Ele, document.getElementById("root"));

