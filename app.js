// Sayfa geçişi
const pages = document.querySelectorAll('.page');
document.querySelectorAll('.menu button').forEach(btn=>{
  btn.onclick=()=>{ pages.forEach(p=>p.classList.remove('active')); document.getElementById(btn.dataset.page).classList.add('active'); }
});

// LocalStorage state
let state={balance:2700,tx:[],height:175,weight:86};
function save(){localStorage.setItem('harun_pa_v2',JSON.stringify(state))}
function load(){const s=localStorage.getItem('harun_pa_v2');if(s)state=JSON.parse(s);render();}
function render(){
  document.getElementById('balance').innerText=state.balance+' TL';
  const txlist=state.tx.slice().reverse().map(t=>`<div>${t.type==='income'?'+':'-'} ${t.amount} TL <small>${t.date}</small></div>`).join('');
  document.getElementById('txlist').innerHTML=txlist||'<small>Henüz işlem yok</small>';
  document.getElementById('height').value=state.height;
  document.getElementById('weight').value=state.weight;
  updateBmi();
}

// Bakiye
document.getElementById('addTx').onclick=()=>{
  const amount=Number(document.getElementById('amount').value);
  const type=document.getElementById('type').value;
  if(!amount||amount<=0)return alert('Geçerli miktar gir');
  const date=new Date().toLocaleString();
  state.tx.push({amount,type,date});
  state.balance+=type==='income'?amount:-amount;
  save();render();
  document.getElementById('amount').value='';
};

// BMI & Egzersiz
function updateBmi(){
  const h=Number(state.height)/100,w=Number(state.weight);
  if(!h||!w){ document.getElementById('bmi').innerText='—'; return; }
  const bmi=Math.round((w/(h*h))*10)/10;
  document.getElementById('bmi').innerText=bmi;
  const box=document.getElementById('exercise');
  let arr=[];
  if(bmi<18.5) arr=['Kilo al: haftada 3 kuvvet antrenmanı, kalori artır.'];
  else if(bmi<25) arr=['Kilo kontrolü: Haftada 3 cardio 20-30 dk, direnç çalış. Günlük 15–20 dk ev antrenmanı.'];
  else if(bmi<30) arr=['Hafif obez: Haftada 4 cardio 30-45 dk, kalori açığı hedefle. Yemekhane tercih et.'];
  else arr=['Uzman önerisi gerekiyor. Doktora danış.'];
  box.innerHTML = arr.map(s=>'• '+s).join('<br>');
}
document.getElementById('calcBmi').onclick=()=>{
  state.height=Number(document.getElementById('height').value)||state.height;
  state.weight=Number(document.getElementById('weight').value)||state.weight;
  save();render();
};

// Asistan
document.getElementById('ask').onclick=()=>{
  const q=document.getElementById('query').value.trim().toLowerCase();
  const ansEl=document.getElementById('answer'); if(!q)return;
  if(q.includes('ne kadar')&&q.includes('kald')){ansEl.innerText=`Kalan bakiye: ${state.balance} TL`;return;}
  if(q.match(/alışveriş|almalı|almam/)){ const num=(q.match(/\d+/)||[0])[0]; const price=Number(num);
    if(price<=state.balance*0.05) ansEl.innerText='Alınabilir.';
    else if(price<=state.balance*0.15) ansEl.innerText='Düşünebilirsin.';
    else ansEl.innerText='Alma. Birikim hedefini bozar.'; return;}
  if(q.includes('ödev')){ansEl.innerText='Önce en acilini yap, 25-30 dk çalış.'; return;}
  if(q.includes('spor')||q.includes('egzersiz')){ansEl.innerText='Bugün: 20 squat, 10 şınav, 30s plank, 20 mountain climber.'; return;}
  if(q.includes('ingilizce')){ansEl.innerText='Günlük 10 kelime: start, again, important, friend, morning ...'; return;}
  ansEl.innerText='Yerel modda cevap veriliyor';
};
document.getElementById('clear').onclick=()=>{document.getElementById('query').value='';document.getElementById('answer').innerText='';};

// Haftalık alarm
async function requestNotif(){if(Notification.permission==='granted') return true; const p=await Notification.requestPermission();return p==='granted';}
document.getElementById('setAlarm').onclick=async ()=>{
  const ok=await requestNotif(); if(!ok){alert('Bildirim izni gerekli');return;}
  const [hh,mm]=document.getElementById('wakeTime').value.split(':').map(Number);
  scheduleDaily(hh,mm); alert('Alarm kuruldu (tarayıcı bildirimi)');
};
let alarmTimer=null;
function scheduleDaily(hh,mm){
  if(alarmTimer) clearTimeout(alarmTimer);
  const now=new Date(), next=new Date();
  next.setHours(hh,mm,0,0);
  if(next<=now) next.setDate(next.getDate()+1);
  const until=next-now;
  alarmTimer=setTimeout(()=>{notify('Uyanma Zamanı',`Saat ${hh}:${mm} — Kalk!`);setInterval(()=>notify('Uyanma Zamanı','Gün başlıyor!'),24*3600*1000);},until);
}
function notify(title,body){try{new Notification(title,{body})}catch(e){console.log(e);}}

// Başlat
load();
