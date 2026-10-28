import {useEffect,useMemo,useState} from "react";

const F=(k,l,ph,req)=>({k,l,ph,req});

const TEMPLATES=[
 {id:"subject",name:"Email subject lines",role:"an email marketing specialist who writes subject lines people actually open",goal:"Write 10 subject lines for an email campaign",out:"A numbered list of 10 subject lines, each under 50 characters, with a one-line reason for each",fields:[F("product","What is the email about?","e.g. Spring sale on skincare",1),F("audience","Who is it for?","e.g. Returning customers aged 25-40",1),F("offer","Offer or main benefit","e.g. 20% off until Sunday")]},

 {id:"welcome",name:"Welcome email",role:"a lifecycle email copywriter",goal:"Write a welcome email for new subscribers",out:"Subject line, preview text, and the email body with one clear call to action",fields:[F("brand","Brand and what it sells","e.g. A small coffee roaster selling beans online",1),F("audience","Who just subscribed?","e.g. People who signed up for a 10% discount",1),F("next","What should they do next?","e.g. Browse the bestsellers")]},

 {id:"winback",name:"Win-back email",role:"a retention-focused email copywriter",goal:"Write a win-back email for customers who have gone quiet",out:"Subject line, preview text, and a short email body with one call to action",fields:[F("brand","Brand and product","e.g. Online yoga studio",1),F("gap","How long have they been inactive?","e.g. 90 days",1),F("incentive","Incentive, if any","e.g. One free class")]},

 {id:"ad",name:"Ad copy",role:"a performance marketing copywriter",goal:"Write ad copy variations for a paid campaign",out:"Three variations, each with a headline, primary text and call-to-action button label",fields:[F("product","Product or service","e.g. Meal-prep delivery",1),F("audience","Target audience","e.g. Busy professionals in big cities",1),F("platform","Platform","e.g. Instagram, Google Search",1),F("usp","Main selling point","e.g. Ready in 3 minutes")]},

 {id:"landing",name:"Landing page headline",role:"a conversion copywriter",goal:"Write headline and subheadline options for a landing page",out:"Five headline and subheadline pairs, each with a note on the angle it takes",fields:[F("product","What does the page offer?","e.g. Free 14-day project tool trial",1),F("audience","Who is the visitor?","e.g. Freelancers who manage several clients",1),F("pain","Problem it solves","e.g. Missed deadlines and scattered files")]},

 {id:"ab",name:"A/B test ideas",role:"a conversion rate optimisation strategist",goal:"Suggest A/B tests for an email or page",out:"A table with test idea, hypothesis, metric to watch, and expected effort (low, medium or high)",fields:[F("asset","What are you testing?","e.g. Abandoned cart email",1),F("metric","Metric you want to improve","e.g. Click rate",1),F("current","Current result, if known","e.g. 2.1% click rate")]},

 {id:"social",name:"Social content plan",role:"a social media strategist",goal:"Create a one-week social media content plan",out:"A day-by-day table with post idea, format, caption draft and hashtag suggestions",fields:[F("brand","Brand and what it does","e.g. Local bakery",1),F("audience","Audience","e.g. Neighbourhood families",1),F("platform","Platform","e.g. Instagram",1),F("goal","Goal of the week","e.g. Promote weekend pre-orders")]},

 {id:"product",name:"Product description",role:"an e-commerce copywriter",goal:"Write a product description that helps shoppers decide",out:"A headline, a 60-word description and three benefit bullets",fields:[F("product","Product","e.g. Waterproof hiking backpack",1),F("features","Key features","e.g. 30L, padded straps, rain cover",1),F("audience","Who buys it?","e.g. Weekend hikers")]}
];

const TONES=["Friendly","Professional","Playful","Confident","Warm","Urgent","Simple"];
const LENGTHS=["Short","Medium","Detailed"];

const CHECKS=[
 ["Role","Gives the AI a clear role"],
 ["Goal","States the task"],
 ["Context","Fills the required details"],
 ["Audience","Says who it is for"],
 ["Tone","Sets a tone"],
 ["Rules","Adds your own rules"],
 ["Format","Describes the output"]
];

const load=k=>{
 try{
  return JSON.parse(localStorage.getItem(k))
 }catch{
  return null
 }
};

export default function App(){

 const [tid,setTid]=useState(TEMPLATES[0].id),
       [vals,setVals]=useState({}),
       [tones,setTones]=useState(["Friendly"]),
       [len,setLen]=useState("Medium"),
       [rules,setRules]=useState(""),
       [ex,setEx]=useState("");

 const [lib,setLib]=useState(()=>load("pp-lib")||[]),
       [name,setName]=useState(""),
       [msg,setMsg]=useState("");

 useEffect(()=>{
  try{
   localStorage.setItem("pp-lib",JSON.stringify(lib))
  }catch{}
 },[lib]);

 useEffect(()=>{
  if(!msg)return;

  const t=setTimeout(()=>setMsg(""),2200);

  return()=>clearTimeout(t)
 },[msg]);

 const T=TEMPLATES.find(t=>t.id===tid);

 const prompt=useMemo(()=>{

  const ctx=T.fields
   .filter(f=>vals[f.k]?.trim())
   .map(f=>"- "+f.l.replace(/\?$/,"")+": "+vals[f.k].trim());

  const lines=[
   "You are "+T.role+".",
   "",
   "Task: "+T.goal+".",
   "",
   "Context:",
   ...(ctx.length?ctx:["- (add your details on the left)"]),
   "",
   "Tone: "+(tones.length?tones.join(", ").toLowerCase():"your choice")+".",
   "Length: "+len.toLowerCase()+"."
  ];

  if(rules.trim())
   lines.push(
    "",
    "Rules to follow:",
    ...rules
     .trim()
     .split("\n")
     .filter(Boolean)
     .map(r=>"- "+r.replace(/^[-•]\s*/,""))
   );

  if(ex.trim())
   lines.push(
    "",
    "Match the style of this example, but do not copy it:",
    '"'+ex.trim()+'"'
   );

  lines.push(
   "",
   "Output format: "+T.out+".",
   "",
   "Ask me one question first if anything important is missing."
  );

  return lines.join("\n")

 },[T,vals,tones,len,rules,ex]);

 const req=T.fields.filter(f=>f.req);

 const filled=req.filter(
  f=>vals[f.k]?.trim()
 ).length;

 const aud=T.fields.find(f=>f.k==="audience");

 const pass=[
  true,
  true,
  filled===req.length,
  aud?!!vals.audience?.trim():filled>0,
  tones.length>0,
  !!rules.trim(),
  true
 ];

 const score=Math.round(
  pass.filter(Boolean).length/pass.length*100
 );

 const level=
  score>=85
   ?"Strong"
   :score>=60
   ?"Good start"
   :"Needs detail";

 const copy=async(t=prompt)=>{
  try{
   await navigator.clipboard.writeText(t);
   setMsg("Copied to clipboard")
  }catch{
   setMsg("Copy failed. Select the text and copy it by hand.")
  }
 };

 const pick=id=>{
  setTid(id);
  setVals({});
 };

 const save=()=>{
  const n=name.trim()||T.name;

  setLib([
   {
    id:Date.now(),
    name:n,
    tid,
    vals,
    tones,
    len,
    rules,
    ex
   },
   ...lib
  ]);

  setName("");
  setMsg("Saved to your library");
 };

 const open=s=>{
  setTid(s.tid);
  setVals(s.vals);
  setTones(s.tones);
  setLen(s.len);
  setRules(s.rules);
  setEx(s.ex);

  window.scrollTo({
   top:0,
   behavior:"smooth"
  });
 };

 const tog=t=>
  setTones(
   tones.includes(t)
    ?tones.filter(x=>x!==t)
    :[...tones,t]
  );

 return <div className="app">

  <header>
   <h1>PromptPilot</h1>
   <p>
    Turn a campaign goal into a clear prompt for any AI tool.
   </p>
  </header>

  <nav className="tpl" aria-label="Choose a goal">

   {TEMPLATES.map(t=>
    <button
     key={t.id}
     className={tid===t.id?"on":""}
     onClick={()=>pick(t.id)}
    >
     {t.name}
    </button>
   )}

  </nav>

  <div className="cols">

   <section className="panel">

    <h2>{T.name}</h2>

    {T.fields.map(f=>
     <label key={f.k} className="fld">

      {f.l}

      {f.req&&<em> required</em>}

      <input
       value={vals[f.k]||""}
       placeholder={f.ph}
       onChange={e=>
        setVals({
         ...vals,
         [f.k]:e.target.value
        })
       }
      />

     </label>
    )}

    <div className="fld">

     Tone

     <div
      className="chips"
      role="group"
      aria-label="Tone"
     >

      {TONES.map(t=>
       <button
        key={t}
        aria-pressed={tones.includes(t)}
        className={tones.includes(t)?"on":""}
        onClick={()=>tog(t)}
       >
        {t}
       </button>
      )}

     </div>

    </div>

    <div className="fld">

     Length

     <div
      className="chips"
      role="group"
      aria-label="Length"
     >

      {LENGTHS.map(l=>
       <button
        key={l}
        aria-pressed={len===l}
        className={len===l?"on":""}
        onClick={()=>setLen(l)}
       >
        {l}
       </button>
      )}

     </div>

    </div>

    <label className="fld">

     Your rules
     <em>one per line, optional</em>

     <textarea
      rows="3"
      value={rules}
      placeholder={"No emojis\nMention free shipping\nAvoid the word 'cheap'"}
      onChange={e=>setRules(e.target.value)}
     />

    </label>

    <label className="fld">

     Example you like
     <em>optional</em>

     <textarea
      rows="2"
      value={ex}
      placeholder="Paste a short line or paragraph with the style you want"
      onChange={e=>setEx(e.target.value)}
     />

    </label>

   </section>

   <section className="side">

    <div className="panel dark">

     <div className="top">

      <h2>Your prompt</h2>

      <span
       className={
        "lvl "+
        (score>=85
         ?"s"
         :score>=60
         ?"g"
         :"n")
       }
      >
       {level}
      </span>

     </div>

     <pre aria-live="polite">
      {prompt}
     </pre>

     <div className="act">

      <button
       className="btn"
       onClick={()=>copy()}
      >
       Copy prompt
      </button>

      <span
       className="msg"
       role="status"
      >
       {msg}
      </span>

     </div>

    </div>

    <div className="panel">

     <div className="top">

      <h2>Prompt strength</h2>

      <b>{score}%</b>

     </div>

     <div className="meter">
      <i style={{width:score+"%"}}/>
     </div>

     <ul className="chk">

      {CHECKS.map(([a,b],i)=>
       <li
        key={a}
        className={pass[i]?"y":"n"}
       >

        <span aria-hidden="true">
         {pass[i]?"✓":"○"}
        </span>

        <span>
         <strong>{a}</strong>
         {" "}
         <small>{b}</small>
        </span>

       </li>
      )}

     </ul>

     {filled<req.length&&
      <p className="tip">
       Fill in {req.length-filled} more required{" "}
       {req.length-filled>1?"fields":"field"}
       {" "}for a sharper answer.
      </p>
     }

    </div>

    <div className="panel">

     <h2>Save for later</h2>

     <div className="row">

      <input
       value={name}
       placeholder={T.name}
       aria-label="Name this prompt"
       onChange={e=>setName(e.target.value)}
      />

      <button
       className="btn"
       onClick={save}
      >
       Save prompt
      </button>

     </div>

    </div>

   </section>

  </div>

  <section className="panel lib">

   <h2>Your library</h2>

   {lib.length?

    <ul>

     {lib.map(s=>
      <li key={s.id}>

       <div>

        <strong>{s.name}</strong>

        <small>
         {TEMPLATES.find(
          t=>t.id===s.tid
         )?.name}
        </small>

       </div>

       <div className="lb">

        <button
         className="btn ghost"
         onClick={()=>open(s)}
        >
         Open
        </button>

        <button
         className="del"
         aria-label={"Delete "+s.name}
         onClick={()=>
          setLib(
           lib.filter(
            x=>x.id!==s.id
           )
          )
         }
        >
         ×
        </button>

       </div>

      </li>
     )}

    </ul>

    :

    <p className="empty">
     Nothing saved yet. Fill in a goal you use often
     and choose Save prompt to reuse it.
    </p>

   }

  </section>

  <footer>
   PromptPilot only builds prompts. Paste them into the AI tool you use.
   Saved prompts stay in this browser.
  </footer>

 </div>;
                                                                                                                                                                                                                                                                                                                                                                     }
