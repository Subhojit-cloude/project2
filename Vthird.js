//const startBtn=document.querySelector("#start");
//const stopBtn=document.querySelector("#stop");
//const speakBtn=document.querySelector("#speak");
const clickBtn=document.querySelector("#content1");
//const Btn=document.querySelector(".talk");
const time=document.querySelector("#time");



//friday commands

let fridayComs=[]
fridayComs.push("activate jarvis");
fridayComs.push("you are fine");
fridayComs.push("hello, jarvis");
fridayComs.push("open youtube");
fridayComs.push("opening youtube");
fridayComs.push("open google");
fridayComs.push("opening google");
fridayComs.push("please search");
fridayComs.push("play");
fridayComs.push("please open my insta profile");
fridayComs.push("please open my github profile");
//fridayComs.push("play");



// for weather
function weather(location) {
    const weatherCont=document.querySelector(".temp").querySelectorAll("*")


    
    let url = `http://api.openweathermap.org/data/2.5/weather?q=${location}&appid=48ddfe8c9cf29f95b7d0e54d6e171008`;
    const xhr = new XMLHttpRequest();

    xhr.open("GET", url, true);

    xhr.onload = function () {
        if (this.status === 200) {
            let data = JSON.parse(this.responseText);
            weatherCont[0].textContent = `Location : ${data.name}`;
            weatherCont[1].textContent = `Country : ${data.sys.country}`;
           weatherCont[2].textContent = `Weather type : ${data.weather[0].main}`;
           weatherCont[3].textContent = `Weather description : ${data.weather[0].description}`;
           weatherCont[4].src = `http://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
           weatherCont[5].textContent = `Original Temperature : ${ktc(data.main.temp)}`;  
           weatherCont[6].textContent = ` feels like ${ktc(data.main.feels_like)}`;
           weatherCont[7].textContent = `Min temperature ${ktc(data.main.temp_min)}`;
           weatherCont[8].textContent = `Max temperature ${ktc(data.main.temp_max)}`;
           weatherStatement=`sir the weather in ${data.name} is ${data.weather[0].description}and the temperature feels like ${ktc(data.main.feels_like)}`; 

        } else {
           weatherCont[0].textContent="Weather Info not Found"
        }
    }

    xhr.send();
}


function ktc(k) {
    k = (k - 273.15);
    return k.toFixed(2);
}
//for time

//    let date=new Date();
//    let hrs=date.getHours();
//    let mins=date.getMinutes();
//    let secs=date.getSeconds();
    
//    window.onload = () =>{
       
  //      time.textContent=`${hrs} : ${mins} : ${secs}`
    //    setInterval(() => {
      //      let date=new Date();
//    let hrs=date.getHours();
  //  let mins=date.getMinutes();
//    let secs=date.getSeconds();
  //  time.textContent=`${hrs} : ${mins} : ${secs}`
    
    //    },1000)
   // }


if(localStorage.getItem("jarvis_setup") !==null){
    weather(JSON.parse(localStorage.getItem("jarvis_setup")).location);

}

const setup=document.querySelector(".jarvis_setup")
setup.style.display= "none"
if(localStorage.getItem("jarvis_setup") === null){
    setup.style.display="block"
    setup.querySelector("button").addEventListener("click",userInfo)
}

function userInfo(){
    let setupInfo={
        name:setup.querySelectorAll("input")[0].value,
        bio:setup.querySelectorAll("input")[1].value,
        location:setup.querySelectorAll("input")[2].value,
        instagram:setup.querySelectorAll("input")[3].value,
        github:setup.querySelectorAll("input")[4].value,
    }

    let testArr=[]
    setup.querySelectorAll("input").forEach((e) => {
        testArr.push(e.value)
    })
    if(testArr.includes("")){
        readOut("please enter your complete Information");
        }
        else{
            localStorage.clear()
            localStorage.setItem("jarvis_setup",JSON.stringify(setupInfo))
            setup.style.display= "none"
             weather(JSON.parse(localStorage.getItem("jarvis_setup")).location)
        }

    

}



const SpeechRecognition=
window.SpeechRecognition||window.webkitSpeechRecognition;

const recognition=new SpeechRecognition();
//for start
recognition.onstart=function(){
    console.log(" active");
};

let windowsB=[]

// for result
recognition.onresult=function(event){
   
    let current=event.resultIndex;
    let transcript=event.results[current][0].transcript;
    transcript=transcript.toLowerCase();
    let userdata = localStorage.getItem("jarvis_setup");
    console.log(`my words : ${transcript}`);
    

    if(transcript.includes("activate jarvis")){
        readOut("activated sir");
        
    }
    if(transcript.includes("open your commands")){
        readOut("ok sir");
       let a = window.open("http://127.0.0.1:5500/Project/commands.html");
        windowsB.push(a)
    }
    if(transcript.includes("clear all information")){
        readOut("ok sir take it");
        localStorage.clear();
        
    }
    if(transcript.includes("tell me today's top headlines")){
        readOut("ok sir");
        getNews();
    }
    if(transcript.includes( "you are fine")){
        readOut("i am fine what about you sir");
    }    

    if(transcript.includes("hello, jarvis")){
        readOut("hello sir how may can i help you");
    }
    
    if(transcript.includes("shut down jarvis.")){
        readOut("ok sir take it");
        recognition.stop();
    }
    if(transcript.includes("open youtube")||transcript.includes("opening youtube")){
        readOut("opening youtube sir");
      let a=  window.open("https://www.youtube.com/");
      windowsB.push(a)
    }
    if(transcript.includes("open google")||transcript.includes("opening google")){
        readOut("opening google sir");
       let a= window.open("https://www.google.co.in/");
       windowsB.push(a)
    }
    if(transcript.includes("please search")){
        readOut("here's the result");
        let input=transcript.split("");
        input.splice(0,14);
        input.pop();
        input=input.join("").split(" ").join("+");
        console.log(input);
        let a= window.open(`https://www.google.co.in/search?q=${input}`);
        windowsB.push(a)
    }
    if(transcript.includes("play")||transcript.includes("give me")){
        readOut("ok sir");
        let song=transcript.split("");
       song.splice(0,6);
        song.pop();
        song=song.join("").split(" ").join("+");
        console.log(song);
        let a=window.open(`https://www.youtube.com/results?search_query=${song}`);
        windowsB.push(a);
    }
     if(transcript.includes("please open my insta profile")){
        readOut("opening your insta profile sir");
       let a= window.open(`https://www.instagram.com/${JSON.parse(userdata).Instagram}/`);
       windowsB.push(a)
    }
    //https://github.com/Subhojit-cloude
    if(transcript.includes("please open my github profile")){
        readOut("opening your github profile sir");
        let a=window.open(`https://github.com/${JSON.parse(userdata).github}/`);
        windowsB.push(a)
    }
    if(transcript.includes("what are your commands")){
        readOut("i followed the following commands");
        document.querySelector(".commands").style.display="block"
    }
    if(transcript.includes("close all tabs")){
        readOut("closing all tabs sir");
        windowsB.forEach(e => {
            e.close()
            
        });
      
       
        }
       
    };

//for end
recognition.onend=function(){
    console.log(" deactive");
};



//for it continuous
recognition.continuous=true;

clickBtn.addEventListener("click",()=>{
    recognition.start();
   // getNews();
    
    

});
//stopBtn.addEventListener("click",()=>{
  //  recognition.stop();

//});

// for jarvis voice
function readOut(message){
    const speech= new SpeechSynthesisUtterance();
// voice change
//const allVoices=speechSynthesis.getVoices();
    speech.text=message;
   // speech.voice=allVoices[36];
    speech.volume=1;
    window.speechSynthesis.speak(speech);
    console.log("speaking out");
}
//speakBtn.addEventListener("click",()=>{

function wishMe(){
    var day=new Date();
    var hour=day.getHours();

   if(hour>=0 && hour<12){
        readOut("hello sir good morning ");
    }
    else if(hour>=12 && hour<17){
        readOut("hello sir good afternoon ");
    }else{
    
     readOut("hello sir good evening ")}

}
wishMe();

//for news
async function getNews(){
    var url="https://newsapi.org/v2/top-headlines?country=in&apiKey=b0712dc2e5814a1bb531e6f096b3d7d3"
    var req=new Request(url)
    await fetch(req).then((response) => response.json())
    .then((data) => {
        console.log(data);
        let arrNews = data.articles
        //arrNews.length = 10
        let a = []
         arrNews.forEach((e,index) => {
            a.push(index+1)
            a.push("........")
            a.push(e.title)
            a.push(".........")
            
        });
        readOut(a)
    })
}

