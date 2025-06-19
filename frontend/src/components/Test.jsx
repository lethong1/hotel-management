import React, { useState } from 'react'

const Test = () => {
    const [count, setCount] = useState(0)

    const handleIncrement = () => {
        setCount(count+1)
    }
    const handleDecrement = () => {
        setCount(count-1)
    }
  return (
    <div>
        <h1>count:{count}</h1>
        <button onClick={handleIncrement}>+</button>
        <button onClick={handleDecrement}>-</button>
    </div>
    
  )
}

export default Test