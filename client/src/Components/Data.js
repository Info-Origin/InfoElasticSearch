import React from 'react'
import Candidates from './Candidates';
function Data(props) {
    const d =props.data;
  return (
    
        d.map((i, index) => (
            <Candidates source = {i._source} />
            // <div     className="candidates">
            // <h1    >{i._source.name}</h1>
            // <h2 >{i._source.email}</h2>
            // <h2  >{i._source.mobile_number}</h2>
            // </div>
        ))
    
  )
}


   
 
  

export default Data