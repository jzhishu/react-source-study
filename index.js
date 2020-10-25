import React from "./src/react";
import ReactDOM from "./src/react-dom"

function click(){alert("执行一次点击")};

let Ele = (
    <div className="relement" title="黑子" onClick={click} style="background-color: red">
        hello, <span>React</span>
    </div>
)

// 为什么使用在这里只使用了ReacrDOM的render方法，却要引入react？
// 因为render接收的第一个参数是一个虚拟dom，而组件--->虚拟dom需要调用
// React.createElement
ReactDOM.render(Ele, document.getElementById("root"));

