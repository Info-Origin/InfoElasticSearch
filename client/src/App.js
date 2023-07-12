
import './App.css';
import {useState , useEffect} from 'react';
import axios from 'axios';
import Chips from "react-chips";
import ClipLoader from 'react-spinners/ClipLoader';
import Candidates from './Candidates.js';
import Swal from 'sweetalert2';
//import { Chips } from 'primereact/chips';


function App() {

  const totalPages = 10; // Replace with your actual total number of pages


  const [hire,setHire] = useState(false);
  
  function handleName(e) {
    setName(e.target.value);
  }
  const handleEd = (e)=>{
    setEd(e.target.value);
  }
  const handleMob = (e)=>{
    setMob(e.target.value);
  }
  const handleEmail = (e)=>{
    setEmail(e.target.value);
  }
  const handleExp = (e)=>{

    setInputHeight(`${e.target.scrollHeight}px`);
    // console.log(e.target.scrollHeight);
    setExp(e.target.value);
  }
  // Import Axios library if you are using modules
// import axios from 'axios';
const [newSkills,setNewSkills] = useState([])
const [selectedFile, setSelectedFile] = useState(null);
const [name,setName] = useState("");
const [email,setEmail] = useState("");
const [mob,setMob] = useState("");
const [exp,setExp]=useState("");
const [skills,setSkills]=useState([]);
const [ed,setEd] = useState("");
const [q,setQ] = useState("");
const [f,setF] = useState([]);
 const [inputHeight, setInputHeight] = useState('auto');
  const [uploadStatus, setUploadStatus] = useState("");
  const [loading,setLoading] = useState(false);
  const [selectedOption, setSelectedOption] = useState('JS');
  let [color, setColor] = useState("black");

  const [postsPerPage] = useState(3);
  const [currentPage, setCurrentPage] = useState(1);

  const [currentPosts,setCurrentPosts] = useState([]);
  
  const handleFileChange = (event) => {
    // console.log(event.target.files[0])
    setSelectedFile(event.target.files[0]);
  
  };
 const handleSearch =(e)=>{
  setSuggest(true);
  setQ(e.target.value);
 }
 const handleQuery =async ()=>{
const query={
    "query": {
        "match" : {
            "skills" : q
        }
    }
}
  const d = await axios.post("http://localhost:9200/profiles/_search",query);

  setF(d.data.hits.hits);
  // console.log(d.data.hits.hits);
  setCurrentPage(1);

 }
  const handleUpload = async () => {
    setUploadStatus("file uploaded")
    if (selectedFile) {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('option',selectedOption);
      setLoading(true);
    try{
   const d = await axios.post('http://localhost:5000/upload', formData)
  
   const jsObject =selectedOption==='NLP'? JSON.parse(d.data):d.data;

// console.log(jsObject);
setLoading(false);
setName(jsObject.name?jsObject.name:"");
setEmail(jsObject.email?jsObject.email:"");
setMob(jsObject.mobile_number?jsObject.mobile_number:"");
setSkills(jsObject.skills?jsObject.skills:[]);
setExp(jsObject.experience?jsObject.experience:"");
setEd(jsObject.education?jsObject.education:"");
   
      } catch (error) {
        console.log(error)
      }
     
    } 
    
  };
const clickChip=(e)=>{
  console.log("clicked");
}
const handleSkill = (e)=>{
     
     setNewSkills(e.target.value);
      // if(e.keyCode===13){
      // const c = [...skills,e.target.value];
      // setSkills(c)
      // }
    
}
const handleKeyPress = (event) => {
  if(event.key==='Enter'){
  const c = [...skills,newSkills];
  setSkills(c);
  }
};
const handleSelect = (event) => {
  setSelectedOption(event.target.value);
  
}
const [dbid,setDbid] = useState(0);
const handledb = async()=>{
  const newRow = {"name":name,"email":email,"Mobile":mob,"Experience":exp,"skills":skills.join(','),"education":ed};
  
  try {
    const a = await axios.post("http://localhost:5000/api/create/list",newRow);
    if(a.status === 200){
    
      // setAddTodo('');
     setDbid(a.data.insertId);
     console.log(a);
     if(Number.isInteger(a.data.insertId)){
     Swal.fire({
      position: 'top-mid',
      icon: 'success',
      title: 'Your data has been saved to MySQL',
      showConfirmButton: false,
      timer: 1500
    })}

    }
    
   
  } catch (error) {
    Swal.fire({
      position: 'top-end',
      icon: 'success',
      title: 'Could Not Save Your work',
      showConfirmButton: false,
      timer: 1500
    })
    console.log(error);
  }
}
const handleSubmit = async ()=>{
  const newRow = {"dbid":dbid,"name":name,"email":email,"Mobile":mob,"Experience":exp[0],"skills":skills.join(','),"education":ed,"file":selectedFile};
  //console.log("clicked");
 const url = "http://localhost:9200/profiles/_doc";
axios.post(url, newRow)
.then(response => {
  // Handle the response
  console.log(response.data);
  Swal.fire({
    position: 'top-mid',
    icon: 'success',
    title: 'Your data has been synced to elasticSearch',
    showConfirmButton: false,
    timer: 1500
  })
})
.catch(error => {
  // Handle the error
  console.error(error);
});
}
const handleHire = ()=>{
  setHire(!hire);
  console.log(!hire);
}

  
  //const [currentPage, setCurrentPage] = useState(1);

  // Change page
  const handlefwd=()=>{
    let x = currentPage+1;
    setCurrentPage(x);
    // const indexOfLastPost = currentPage*postsPerPage;
    // const indexOfFirstPost = (currentPage-1) * postsPerPage;
    // let s = (x-1)*postsPerPage;
    // let e = x*postsPerPage
    // // setCurrentPosts(f.slice(s,e))
  }
  const handleback= async ()=>{
    var x = currentPage-1;
  //   const query={
  //     "query": {
  //         "match" : {
  //             "skills" : q
  //         }
  //     }
  // }
  //   const d = await axios.post("http://localhost:9200/profiles/_search",query);
  //   setF(d.data.hits.hits);
    setCurrentPage(x);
  }
  // console.log(f.slice((currentPage-1)*postsPerPage,currentPage*postsPerPage));
  const [toSync,setToSync] =useState([]);
  const handleDbSave =(dbid,id,action)=>{
    const newUpdate = [dbid,id,action];
    const fullUpdate =[...toSync,newUpdate];
    console.log(newUpdate);
    if(action=='update'){
    Swal.fire({
      position: 'top-mid',
      icon: 'success',
      title: 'Entry has been updated',
      showConfirmButton: false,
      timer: 1500
    })
  }
  else{
    Swal.fire({
      position: 'top-mid',
      icon: 'success',
      title: 'Entry has been Deleted',
      showConfirmButton: false,
      timer: 1500
    })
  }
    setToSync(fullUpdate);
  }
  const handleSync= async ()=>{
    for(var i=0;i<toSync.length;i++){
      let udbid = toSync[i][0];
      let uelid = toSync[i][1];
      console.log(udbid, uelid);
      if(toSync[i][2]==='update'){
        // /todo/:id
        try {
          const x = await axios.get(`http://localhost:5000/api/todo/${udbid}`);
          if(x.status === 200){
            const nr = x.data;
            nr.dbid = udbid;
            // setAddTodo('');
            const url = `http://localhost:9200/profiles/_doc/${uelid}`;
            axios.put(url, nr)
            .then(response => {
              // Handle the response
              let foundDictionary = f.find(dictionary => dictionary._id === uelid);
              if (foundDictionary) {
                foundDictionary._source = nr;
                foundDictionary._source.status = 'Updated';
                console.log(foundDictionary);
              }
              // console.log(response.data);
            
            })
            .catch(error => {
              // Handle the error
              console.error(error);
            });
            
          }
          
         
        } catch (error) {
          console.log(error);
        }
      }
      else if(toSync[i][2]==='delete'){
        const url = `http://localhost:9200/profiles/_doc/${uelid}`;
        axios.delete(url)
        .then(response => {
          // // Handle the response
          // console.log(response.data);
          let foundDict = f.find(dictionary => dictionary._id === uelid);
          if (foundDict) {
         
            foundDict._source.status = 'deleted';
            console.log(foundDict);
          }
        })
        .catch(error => {
          // Handle the error
          console.error(error);
        });
        
      }
      Swal.fire({
        position: 'top-mid',
        icon: 'success',
        title: 'Changes Synced',
        showConfirmButton: false,
        timer: 1500
      })
    }
  //   const query={
  //     "query": {
  //         "match" : {
  //             "skills" : q
  //         }
  //     }
  // }
  //   const d = await axios.post("http://localhost:9200/profiles/_search",query);
  
    setF(f);
    setToSync([]);
    let x = currentPage+1;
    setCurrentPage(x);
    

  }
  const xyz = (dbid,id)=>{
    let arrayOfObjects = f.filter((obj) => obj._source.dbid.index !== dbid);
    console.log(arrayOfObjects);
    setF(arrayOfObjects);
  }
 

//   const startIndex = (currentPage - 1) * postsPerPage;
// const endIndex = startIndex + postsPerPage;

// const renderedRows = f.slice(startIndex, endIndex).map((i,index) => (
//   <Candidates onDel={xyz} onSave = {handleDbSave} dbid ={i._source.dbid} id={i._id} source = {i._source}/> 
// ));
const [input, setInput] = useState('');
const [suggestions, setSuggestions] = useState([]);
const [suggest,setSuggest] = useState(false);
const fetchSuggestions = async () => {
  // Perform API call or any other data retrieval logic here
  // Example: fetching suggestions from an API
  //    const query={
  //     "query": {
  //         "match" : {
  //             "skills" : q
  //         }
  //     }
  // }
    const response = await axios.post("http://localhost:9200/profiles/_search");
  const dat = response.data.hits.hits;
  var ar =[];
  dat.forEach((element) => {
    var ski = element._source.skills.split(',');
    ar = [...ar,...ski];
   
  });
  // for(var i=0;i<dat.length();i++){
   
  // }
  var comb = [...new Set(ar)];
  var final = []
  comb.forEach((element)=>{
    const bo = element.toLowerCase().startsWith(q.toLowerCase());
    if(bo){
      final.push(element);
    }
  })
  setSuggestions(final);
};
const handleSClick =(e)=>{
  console.log(e.target.innerHTML);
  setSuggest(false);
  setQ(e.target.innerHTML);

}
useEffect(() => {
  fetchSuggestions();
}, [q]);

  return (
    <div className="main" >
    
    <div className="heading">
      <h1>{hire?"SEARCH CANDIDATES BY SKILLS": "FIND A JOB & GROW YOUR CAREER"}
</h1>
    </div>
    <div className="s">
    <label class="switch">
  <input onChange = {handleHire} type="checkbox"/>
  <span class="slider round"></span>
</label>
    </div>
 {hire &&<div className="skillfilter" >
 <button onClick={handleSync} className="elsync">Sync</button>

 <div class="skill">
  <input value={q} 
   onChange ={handleSearch} className ="InputSubmit"type="text" />
 
  <button onClick={handleQuery} className="skillsubmit">...Search</button>
  
 </div>
 <div>
 <ul>
        {suggest && suggestions.map((suggestion) => (
          <li onClick={handleSClick} key={suggestion}>{suggestion}</li>
        ))}
      </ul>
{
  currentPage==1 && f.slice((currentPage-1)*postsPerPage,currentPage*postsPerPage).map((i, index) => (
   
    <Candidates onDel={xyz} onSave = {handleDbSave} dbid ={i._source.dbid} id={i._id} source = {i._source}/> 
 
  ))
}
{
  currentPage==2 && f.slice((currentPage-1)*postsPerPage,currentPage*postsPerPage).map((i, index) => (
    <Candidates onDel={xyz} onSave = {handleDbSave} dbid ={i._source.dbid} id={i._id} source = {i._source}/> 
 
  ))
}
{
  currentPage==3 && f.slice((currentPage-1)*postsPerPage,currentPage*postsPerPage).map((i, index) => (
   
    <Candidates onSave = {handleDbSave} dbid ={i._source.dbid} id={i._id} source = {i._source}/> 
 
  ))
}
{
  currentPage==5 && f.slice((currentPage-1)*postsPerPage,currentPage*postsPerPage).map((i, index) => (
   
    <Candidates onSave = {handleDbSave} dbid ={i._source.dbid} id={i._id} source = {i._source}/> 
 
  ))
}
{
  currentPage==6 && f.slice((currentPage-1)*postsPerPage,currentPage*postsPerPage).map((i, index) => (
   
    <Candidates onSave = {handleDbSave} dbid ={i._source.dbid} id={i.id} source = {i._source}/> 
  ))
}
{
  currentPage==7 && f.slice((currentPage-1)*postsPerPage).map((i, index) => (
    <Candidates onSave = {handleDbSave} dbid ={i._source.dbid} id={i._source.id} source = {i._source}/> 
 
  ))
}
</div>
<div className="paginate">
<button className='fwd' onClick={handleback}>{'<'}</button>
<button className = 'no'>{currentPage}</button>
<button className ='bwd' onClick = {handlefwd}>{'>'}</button>
</div>
  </div>
 }

 {!hire &&   <div className="App">
  
     <div className = "resUpload">
     <input  className="resume" onChange={handleFileChange}   type="file" name = "file" />
     <select onChange={handleSelect}  name="parse" id="cars">
  <option value="JS">JS</option>
  <option value="NLP">NLP</option>
 </select>
     <button  className = "upload" type = "button" onClick={handleUpload}>Upload Resume</button>
     
      </div>
      {loading && <ClipLoader
        color={color}
        loading={loading}
        
        size={150}
        aria-label="Loading Spinner"
        data-testid="loader"
      />}
      <div className="data">
      
    
      <div className="dat">
      <div className="lbl">
      <label  >Name</label>
      </div>
     
      <input   className = "ipt" value = {name} onChange={handleName} ></input>
      </div> 
      <div className="dat">
      <div className="lbl">
      <label >Email</label>
      </div>
     
      <input className = "ipt" value = {email} onChange={handleEmail} ></input>
      </div>
      <div className="dat">
      <div className="lbl">
      <label  >Mobile No</label>
      </div>
     
      <input className = "ipt" value = {mob} onChange={handleMob} ></input>
      </div>
      <div className="dat">
      <div className="lbl">
      <label  >Education</label>
      </div>
     
      <input className = "ipt" value = {ed} onChange={handleEd} ></input>
      </div>
      <div className="dat">
      <div className="lbl">
      <label  >Experience</label>
      </div>
{/*      
      <input className = "ipt" value = {exp} onChange={handleExp} ></input> */}
      <textarea className="ip"
      value={exp}
      onChange={handleExp}
      style={{ height: `${inputHeight}px` }}
    />
      </div>
      <div className="dat">
      <div className="lbl">
      <label  >Skills</label>
      </div>
     
      <input className = "ipt"    onChange={handleSkill} onKeyDown={handleKeyPress}  ></input>
     
            {/* <Chips
          value={skills}
          onChange={ChiponChange}
          suggestions={skills}
          className="chip"
        />
    */}
      </div>
      <Chips
          value={skills}
          onClick={clickChip}
          suggestions={skills}
          
        />
        {/* <ReactChipInput
      chip-color="blue"
      classes="class1 class2 chipinput"
      chips={skills}
     
    /> */}
      
      </div>

    
    <div className="submit">
      <button type="submit" onClick = {handledb} className="send">
         Save
      </button>
      <button type="submit" onClick = {handleSubmit} className="send">
         Sync
      </button>
    </div>
    {uploadStatus && <p>{uploadStatus}</p>}
    </div>}
    </div>
  );
};


export default App;
