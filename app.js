/*
 * مِيقات — GitHub Pages, no build step.
 * Uses AlAdhan prayer-times API and the browser's Umm al-Qura calendar.
 * Temporal clock is a proposed hybrid presentation, NOT a prescribed religious hour-numbering system.
 */
'use strict';

const CITIES = {
  riyadh: { label:'الرياض، السعودية', lat:24.7136, lon:46.6753, tz:'Asia/Riyadh', method:4 },
  makkah: { label:'مكة المكرمة، السعودية', lat:21.4225, lon:39.8262, tz:'Asia/Riyadh', method:4 },
  madinah:{ label:'المدينة المنورة، السعودية',lat:24.4672,lon:39.6111,tz:'Asia/Riyadh',method:4 },
  jeddah: { label:'جدة، السعودية',lat:21.5433,lon:39.1728,tz:'Asia/Riyadh',method:4 },
  dammam: { label:'الدمام، السعودية',lat:26.4207,lon:50.0888,tz:'Asia/Riyadh',method:4 },
  dubai: { label:'دبي، الإمارات',lat:25.2048,lon:55.2708,tz:'Asia/Dubai',method:8 },
  cairo: { label:'القاهرة، مصر',lat:30.0444,lon:31.2357,tz:'Africa/Cairo',method:5 },
  istanbul: { label:'إسطنبول، تركيا',lat:41.0082,lon:28.9784,tz:'Europe/Istanbul',method:13 },
  kuala: { label:'كوالالمبور، ماليزيا',lat:3.1390,lon:101.6869,tz:'Asia/Kuala_Lumpur',method:17 },
  london: { label:'لندن، المملكة المتحدة',lat:51.5074,lon:-0.1278,tz:'Europe/London',method:3 }
};
const $ = id => document.getElementById(id);
const AR_HOURS = ['الأولى','الثانية','الثالثة','الرابعة','الخامسة','السادسة','السابعة','الثامنة','التاسعة','العاشرة','الحادية عشرة','الثانية عشرة'];
const PRAYERS = [ ['Fajr','الفجر'], ['Sunrise','الشروق'], ['Dhuhr','الظهر'], ['Asr','العصر'], ['Maghrib','المغرب'], ['Isha','العشاء'] ];
const S = (title, desc, source, url, tag='سُنّة ثابتة') => ({title,desc,source,url,tag});
const SOURCES = {
  fajr:'https://sunnah.com/bukhari:618',
  afterPrayer:'https://sunnah.com/bukhari:843',
  sitAfterFajr:'https://sunnah.com/muslim:670b',
  duha:'https://sunnah.com/muslim:720',
  rawatib:'https://sunnah.com/bukhari:1180',
  evening:'https://quran.com/33/42',
  noAsr:'https://sunnah.com/bukhari:586',
  ishaSleep:'https://sunnah.com/bukhari:568',
  sleep:'https://sunnah.com/bukhari:6311',
  ayat:'https://sunnah.com/bukhari:2311',
  night:'https://sunnah.com/bukhari:7494',
  witr:'https://sunnah.com/muslim:755a',
  friday:'https://sunnah.com/ibnmajah:1087'
};
const entries = {
  dawnFajr:S('ركعتا سنّة الفجر','صلّ ركعتين خفيفتين بعد دخول الفجر وقبل صلاة الفريضة، إن لم تكن صليتهما.','صحيح البخاري 618',SOURCES.fajr),
  morning:S('الذكر في أول النهار','اذكر الله في الصباح، وابدأ يومك بما ينفعك. لا يُلزم هذا التذكير نصًّا بعينه في كل دقيقة.','الأحزاب: 42',SOURCES.evening,'ذكر مشروع'),
  sit:S('المكث بعد صلاة الفجر','من هديه ﷺ أنه كان يمكث في مصلّاه بعد الفجر حتى تطلع الشمس.','صحيح مسلم 670ب',SOURCES.sitAfterFajr),
  duha:S('صلِّ ركعتي الضحى','بعد ارتفاع الشمس، ومن وقت الضحى إلى قبيل الزوال؛ تُجزئ ركعتان من الضحى عن صدقة المفاصل.','صحيح مسلم 720',SOURCES.duha),
  generalDhikr:S('أكثر من ذكر الله','سبّح واحمد الله وكبّره في يومك؛ الذكر ليس محصورًا في رقم ساعة معينة.','صحيح مسلم 720',SOURCES.duha,'ذكر مستحب'),
  zuhrBefore:S('السنّة قبل الظهر','من السنن الراتبة الواردة ركعتان قبل صلاة الظهر.','صحيح البخاري 1180',SOURCES.rawatib),
  zuhrAfter:S('السنّة بعد الظهر','حافظ على ركعتي السنّة بعد الظهر إذا أديت الفريضة.','صحيح البخاري 1180',SOURCES.rawatib),
  afterPrayer:S('أذكار ما بعد الصلاة','بعد الفرائض قل التسبيح والتحميد والتكبير مما ثبت في السنة.','صحيح البخاري 843',SOURCES.afterPrayer),
  evening:S('الذكر بالعشيّ','اذكر الله بكرةً وأصيلًا، والمساء موضع مشروع للذكر.','الأحزاب: 42',SOURCES.evening,'ذكر مشروع'),
  avoidSunrise:S('تمهّل حتى ترتفع الشمس','يُنهى عن التطوع المطلق بعد الفجر حتى ترتفع الشمس؛ اذكر الله حتى يحين الضحى.','صحيح البخاري 586',SOURCES.noAsr,'تنبيه فقهي'),
  avoidNafl:S('انتبه لوقت النفل','ثبت النهي عن صلاة التطوع المطلقة بعد العصر حتى تغرب الشمس، مع وجود استثناءات فقهية.','صحيح البخاري 586',SOURCES.noAsr,'تنبيه فقهي'),
  maghribRaw:S('ركعتا سنّة المغرب','بعد فريضة المغرب، صلّ ركعتي السنة الراتبة.','صحيح البخاري 1180',SOURCES.rawatib),
  ishaRaw:S('ركعتا سنّة العشاء','إذا صليت العشاء، فأدِّ ركعتي السنّة الراتبة.','صحيح البخاري 1180',SOURCES.rawatib),
  noChat:S('تهيّأ للراحة','كان ﷺ يكره الحديث بعد العشاء بلا حاجة، فلا تجعل السهر يضيّع عليك الفجر.','صحيح البخاري 568',SOURCES.ishaSleep),
  sleep:S('نم على شقّك الأيمن','من سنن النوم: أن تتوضأ وضوءك للصلاة، ثم تضطجع على شقك الأيمن وتأتي بالذكر.','صحيح البخاري 6311',SOURCES.sleep),
  ayat:S('اقرأ آية الكرسي عند نومك','ورد فضل قراءة آية الكرسي عند النوم.','صحيح البخاري 2311',SOURCES.ayat),
  qiyam:S('قيام الليل والدعاء','الصلاة من الليل مشروعة، وفي الثلث الأخير فضل عظيم للدعاء والاستغفار.','صحيح البخاري 7494',SOURCES.night),
  witr:S('لا تنسَ الوتر','أوتر قبل أن تنام إن خشيت ألّا تستيقظ آخر الليل؛ وإلّا فآخر الليل أفضل.','صحيح مسلم 755أ',SOURCES.witr),
  friday:S('سنن يوم الجمعة','إذا كان اليوم الجمعة: الاغتسال والتبكير إلى صلاة الجمعة والإنصات للخطبة.','سنن ابن ماجه 1087 (صحيح)',SOURCES.friday)
};

const app = {
  selected:'riyadh', location:{...CITIES.riyadh}, method:4,
  days:null, dayKey:'', fetching:false, lastError:'', lastSource:'', renderKey:'',lastDrawMinute:null, gps:null,
  lastStatus:'', lastCivilKey:'',lastGuidanceKey:'', requestId:0
};
let toastTimer;
function toast(s){const el=$('toast');el.textContent=s;el.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove('show'),4000);}
function status(text,type='loading'){$('dataStatus').className='status'+(type==='ready'?' ready':type==='error'?' error':'');$('dataStatus').lastChild.textContent=text;app.lastStatus=type;}
function digits(n){return String(n).padStart(2,'0');}
function fmtTime(date,zone,seconds=false){
  if(!(date instanceof Date)||!Number.isFinite(date.getTime()))return '--:--';
  const parts=new Intl.DateTimeFormat('en-GB',{timeZone:zone,hour:'2-digit',minute:'2-digit',second:seconds?'2-digit':undefined,hourCycle:'h23'}).formatToParts(date);
  const dict=Object.fromEntries(parts.map(p=>[p.type,p.value]));
  const hour=Number(dict.hour), suffix=hour<12?'ص':'م';
  return `${digits((hour%12)||12)}:${dict.minute}${seconds?':'+dict.second:''} ${suffix}`;
}
function clockParts(date,zone){
  const parts=new Intl.DateTimeFormat('en-GB',{timeZone:zone,year:'numeric',month:'2-digit',day:'2-digit',weekday:'long'}).formatToParts(date);
  return Object.fromEntries(parts.filter(p=>p.type!=='literal').map(p=>[p.type,p.value]));
}
function localKey(date,zone){const p=clockParts(date,zone);return `${p.year}-${p.month}-${p.day}`;}
function plusDays(key,inc){const [y,m,d]=key.split('-').map(Number);return new Date(Date.UTC(y,m-1,d+inc)).toISOString().slice(0,10);}
function fmtApiDay(key){const [y,m,d]=key.split('-');return `${d}-${m}-${y}`;}
function zonedEpoch(key,clock,zone){ // Fallback if API doesn't return ISO-8601 timings.
  const [y,m,d]=key.split('-').map(Number), [h,min]=clock.replace(/\s*\(.*$/,'').split(':').map(Number);
  const wanted=Date.UTC(y,m-1,d,h,min,0);
  let epoch=wanted;
  for(let i=0;i<3;i++){
    const p=new Intl.DateTimeFormat('en-GB',{timeZone:zone,year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit',hourCycle:'h23'}).formatToParts(new Date(epoch));
    const x=Object.fromEntries(p.map(v=>[v.type,v.value]));
    const represented=Date.UTC(+x.year,+x.month-1,+x.day,+x.hour,+x.minute,+x.second);
    epoch+=wanted-represented;
  }
  return new Date(epoch);
}
function validTimings(day){return !!(day?.Fajr&&day?.Sunrise&&day?.Dhuhr&&day?.Asr&&day?.Sunset&&day?.Maghrib&&day?.Isha);}
function hydrateDay(data,key,zone){
  const out={key,zone: data.meta?.timezone||zone};
  for(const name of ['Fajr','Sunrise','Dhuhr','Asr','Sunset','Maghrib','Isha']){
    const v=data.timings?.[name];
    if(typeof v!=='string')throw new Error('أوقات صلاة غير مكتملة');
    out[name]=/^\d{2}:\d{2}/.test(v)?zonedEpoch(key,v,out.zone):new Date(v);
    if(!Number.isFinite(out[name].getTime()))throw new Error('تعذر قراءة مواقيت الصلاة');
  }
  if(!validTimings(out)||out.Fajr>=out.Sunrise||out.Sunrise>=out.Sunset)throw new Error('أوقات الصلاة غير صالحة');
  return out;
}
async function getDay(key,loc,method){
  const cacheKey=`miqat-v3-${loc.lat.toFixed(4)}-${loc.lon.toFixed(4)}-${method}-${key}`;
  let cached;try{cached=JSON.parse(localStorage.getItem(cacheKey)||'null')}catch{}
  if(cached?.data){try{return {day:hydrateDay(cached.data,key,loc.tz),cached:true}}catch{}}
  const qs=new URLSearchParams({latitude:String(loc.lat),longitude:String(loc.lon),method:String(method),iso8601:'true',calendarMethod:'UAQ'});
  const url=`https://api.aladhan.com/v1/timings/${fmtApiDay(key)}?${qs.toString()}`;
  const res=await fetch(url,{headers:{Accept:'application/json'}});
  if(!res.ok)throw new Error(`خطأ في اتصال المواقيت (${res.status})`);
  const json=await res.json();
  if(json.code!==200||!json.data)throw new Error('مزوّد المواقيت لم يُرجع بيانات صحيحة');
  const day=hydrateDay(json.data,key,loc.tz);
  try{localStorage.setItem(cacheKey,JSON.stringify({data:json.data,t:Date.now()}))}catch{}
  return {day,cached:false};
}
async function loadDays(force=false){
  if(app.fetching&&!force)return;
  const token=++app.requestId;
  app.fetching=true;
  app.lastError='';
  status('يُحدِّث المواقيت…');
  const today=localKey(new Date(),app.location.tz);
  const keys=[plusDays(today,-1),today,plusDays(today,1)];
  try{
    const results=await Promise.all(keys.map(key=>getDay(key,app.location,app.method)));
    if(token!==app.requestId)return;
    const zone=results[1].day.zone;
    // Especially useful if the geolocation's returned timezone differs from the device timezone.
    if(zone!==app.location.tz){
      app.location.tz=zone;
      const corrected=localKey(new Date(),zone);
      if(corrected!==today){app.fetching=false;return loadDays(true)}
    }
    app.days={prev:results[0].day,today:results[1].day,next:results[2].day};
    app.dayKey=today;
    app.lastSource=results.every(x=>x.cached)?'cached':'live';
    app.renderKey='';app.lastDrawMinute=null;app.lastCivilKey='';app.lastGuidanceKey='';
    status(app.lastSource==='cached'?'مواقيت محفوظة لليوم':'المواقيت محدّثة','ready');
    tick();
  }catch(e){
    if(token!==app.requestId)return;
    app.days=null;app.dayKey='';app.lastError=e.message||'خطأ في الشبكة';
    status('تعذّر تحميل المواقيت — اضغط للتحديث','error');
    $('sunnahGrid').innerHTML='<div class="loading-card">تعذّر جلب مواقيت الصلاة. تأكد من الإنترنت أو حاول مجددًا؛ لن نعرض تقديرات غير موثوقة على أنها مواقيت مؤكدة.</div>';
    $('prayersList').innerHTML='';
    resetPrayerText();
    $('segments').innerHTML='';$('ticks').innerHTML='';$('clockHand').removeAttribute('transform');
    $('phaseTag').textContent='غير متاح';$('currentPeriod').textContent='بانتظار المواقيت';
    $('hijriDate').textContent='تعذّر تحديد التاريخ وفق الغروب';$('gregDate').textContent='';
    toast('تعذّر جلب المواقيت. افحص اتصال الإنترنت وحاول مجددًا.');
  }finally{if(token===app.requestId)app.fetching=false}
}
function resetPrayerText(){['sunriseValue','sunsetValue','midnightTime','lastThirdTime','nextPrayerTime'].forEach(k=>$(k).textContent='--:--');['dayLength','nightLength','currentPart'].forEach(k=>{if($(k))$(k).textContent='—'});$('nextPrayerName').textContent='—';$('countdown').textContent='--:--:--';$('temporalHour').textContent='—';$('centerSunnah').textContent='بانتظار أوقات الشمس';}
function getFrame(now){
  const {today,prev,next}=app.days;
  if(now.getTime()>=today.Sunset.getTime())return {sunsetStart:today.Sunset,fajr:next.Fajr,sunrise:next.Sunrise,sunsetEnd:next.Sunset,day:next,nightDate:today};
  return {sunsetStart:prev.Sunset,fajr:today.Fajr,sunrise:today.Sunrise,sunsetEnd:today.Sunset,day:today,nightDate:prev};
}
function getPhase(now,frame){
  const t=now.getTime(),nightEnd=frame.fajr.getTime(),dayStart=frame.sunrise.getTime();
  let phase,start,end;
  if(t<nightEnd){phase='night';start=frame.sunsetStart.getTime();end=nightEnd}
  else if(t<dayStart){phase='dawn';start=nightEnd;end=dayStart}
  else{phase='day';start=dayStart;end=frame.sunsetEnd.getTime()}
  const fraction=Math.max(0,Math.min(.999999,(t-start)/(end-start)));
  const index=Math.min(12,Math.floor(fraction*12)+1);
  return {phase,index,fraction,start,end};
}
function eventList(days){return [
  ...PRAYERS.filter(x=>x[0]!=='Sunrise').map(([key,name])=>({name,date:days.today[key],key})),
  {name:'الفجر',date:days.next.Fajr,key:'Fajr'}
].sort((a,b)=>a.date-b.date);}
function nextPrayer(now){return eventList(app.days).find(e=>e.date.getTime()>now.getTime())||null;}
function lengthText(ms){const total=Math.round(ms/12/1000);return `${Math.floor(total/60)} د ${digits(total%60)} ث`;}
function durationClock(ms){let sec=Math.max(0,Math.floor(ms/1000));return `${digits(Math.floor(sec/3600))}:${digits(Math.floor((sec%3600)/60))}:${digits(sec%60)}`;}
function islamicDate(now,todaySunset,zone){
  const nextHijri=now.getTime()>=todaySunset.getTime();
  // Calculate Hijri date from Gregorian wall date, not 36h ahead after sunset.
  const p=clockParts(now,zone), dateKey=`${p.year}-${p.month}-${p.day}`;
  const shifted=nextHijri?plusDays(dateKey,1):dateKey;
  const [y,m,d]=shifted.split('-').map(Number);
  const asUTC=new Date(Date.UTC(y,m-1,d,12));
  return {
    date:new Intl.DateTimeFormat('ar-SA-u-ca-islamic-umalqura',{day:'numeric',month:'long',year:'numeric',timeZone:'UTC'}).format(asUTC),
    civil:new Intl.DateTimeFormat('ar-SA-u-ca-gregory',{weekday:'long',day:'numeric',month:'long',year:'numeric',timeZone:zone}).format(now),
    label: nextHijri?'دخلت الليلة الهجرية الجديدة':'اليوم الهجري',
    shifted
  };
}
function prayerListRender(now){
  const active=nextPrayer(now);
  const showDay=app.days.today;
  $('prayerDate').textContent='بحسب '+app.location.label;
  $('prayersList').innerHTML=PRAYERS.map(([key,name])=>{
    const upcoming=active?.key===key&&app.dayKey===localKey(active.date,app.location.tz);
    return `<div class="prayer-item${upcoming?' next':''}"><span>${name}</span><strong>${fmtTime(showDay[key],app.location.tz)}</strong></div>`;
  }).join('');
}
function circlePoint(angle,r){const a=angle*Math.PI/180;return {x:250+r*Math.sin(a),y:250-r*Math.cos(a)};}
function arcPath(a,b,r){const x=circlePoint(a,r),y=circlePoint(b,r),large=b-a>180?1:0;return `M ${x.x.toFixed(3)} ${x.y.toFixed(3)} A ${r} ${r} 0 ${large} 1 ${y.x.toFixed(3)} ${y.y.toFixed(3)}`;}
function makeDial(frame){
  const start=frame.sunsetStart.getTime(),end=frame.sunsetEnd.getTime();
  const f=(frame.fajr.getTime()-start)/(end-start)*360;
  const s=(frame.sunrise.getTime()-start)/(end-start)*360;
  if(!(f>0&&s>f&&s<360))return;
  const base='<circle cx="250" cy="250" r="192" fill="none" stroke="#657587" stroke-opacity=".2" stroke-width="22" />';
  const segments=[{a:0,b:f,color:'#7f97b1'},{a:f,b:s,color:'#d5aaa0'},{a:s,b:359.999,color:'url(#dayGold)'}];
  $('segments').innerHTML=base+segments.map(z=>`<path d="${arcPath(z.a,z.b,192)}" fill="none" stroke="${z.color}" stroke-width="22" stroke-linecap="butt"/>`).join('');
  const t=[];
  for(const spec of [{start:0,end:f,color:'#afbac5'},{start:s,end:360,color:'#e8c997'}]){
    for(let i=0;i<12;i++){
      const a=spec.start+(spec.end-spec.start)*(i+.5)/12;
      const n=circlePoint(a,175);
      const x=circlePoint(spec.start+(spec.end-spec.start)*i/12,192);
      const y=circlePoint(spec.start+(spec.end-spec.start)*i/12,205);
      t.push(`<line x1="${x.x}" y1="${x.y}" x2="${y.x}" y2="${y.y}" stroke="${spec.color}" stroke-opacity=".8" stroke-width="1.3"/>`);
      t.push(`<text x="${n.x}" y="${n.y+3.3}" text-anchor="middle" font-family="sans-serif" font-size="9.5" fill="${spec.color}" opacity=".9">${i+1}</text>`);
    }
  }
  const dawnPos=circlePoint((f+s)/2,196);
  t.push(`<circle cx="${dawnPos.x}" cy="${dawnPos.y}" r="3" fill="#fff0e0"/>`);
  $('ticks').innerHTML=t.join('');
}
function chosenSuggestions(ctx){
  const {phase,frame,now}=ctx,t=now.getTime();
  const items=[];
  let label='';
  if(phase.phase==='night'){
    const end=frame.fajr.getTime(),begin=frame.sunsetStart.getTime();
    const lastThird=begin+(end-begin)*2/3;
    const nightIsha=now>=app.days.today.Sunset?app.days.today.Isha:app.days.prev.Isha;
    if(t<nightIsha.getTime()){
      label='ما بين المغرب والعشاء';items.push(entries.maghribRaw,entries.evening,entries.generalDhikr);
    }else if(t>=lastThird){
      label='الثلث الأخير من الليل';items.push(entries.qiyam,entries.witr,entries.generalDhikr);
    }else{
      label='ما بعد العشاء';items.push(entries.ishaRaw,entries.witr,entries.sleep);
      if(t>nightIsha.getTime()+65*60000)items.splice(0,1,entries.ayat);
    }
  }else if(phase.phase==='dawn'){
    label='من الفجر إلى الشروق';items.push(entries.dawnFajr,entries.morning,entries.sit);
  }else{
    const rise=frame.sunrise.getTime(),noon=frame.day.Dhuhr.getTime(),asr=frame.day.Asr.getTime(),set=frame.sunsetEnd.getTime();
    if(t<rise+18*60000){label='أول الشروق';items.push(entries.avoidSunrise,entries.morning,entries.generalDhikr)}
    else if(t<noon-20*60000){label='وقت الضحى';items.push(entries.duha,entries.generalDhikr,entries.morning)}
    else if(t<noon){label='قرب صلاة الظهر';items.push(entries.zuhrBefore,entries.generalDhikr,entries.morning)}
    else if(t<asr){label='من الظهر إلى العصر';items.push(entries.zuhrAfter,entries.afterPrayer,entries.generalDhikr)}
    else if(t<set){label='بعد العصر إلى المغرب';items.push(entries.evening,entries.avoidNafl,entries.generalDhikr)}
  }
  // Weekly sunnah only in the daytime of civil Friday, before Jumu'ah. This is not fixed to any numbered hour.
  if(phase.phase==='day'&&t<frame.day.Dhuhr.getTime()&&clockParts(now,app.location.tz).weekday==='Friday')items.splice(1,0,entries.friday);
  // In Arabic locale weekday is Friday only if Intl formatter locale is en-GB (it is).
  return {items:items.slice(0,3),label};
}
function renderGuidance(ctx){
  const {items,label}=chosenSuggestions(ctx);
  const key=label+items.map(x=>x.title).join('|');
  if(app.lastGuidanceKey===key)return;
  app.lastGuidanceKey=key;
  $('guidancePhase').textContent=label;
  $('centerSunnah').textContent=items[0]?.title||'ذكر الله في كل حين';
  $('sunnahGrid').innerHTML=items.map((item,i)=>`<article class="sunnah-card"><span class="card-category">${digits(i+1)} · ${item.tag}</span><h3>${item.title}</h3><p>${item.desc}</p><a class="proof" target="_blank" rel="noopener noreferrer" href="${item.url}" aria-label="اقرأ دليل ${item.title}">◈ الدليل · ${item.source} ↗</a></article>`).join('');
}
function showDate(now){
  const h=islamicDate(now,app.days.today.Sunset,app.location.tz);
  $('hijriDate').textContent=h.date;
  $('gregDate').textContent=h.civil;
  $('hijriDayPhase').textContent=h.label;
  $('locationLabel').textContent='◉ '+app.location.label;
}
function updateLive(now){
  const z=app.location.tz;
  const normal=fmtTime(now,z,true).split(' ');
  $('regularTime').textContent=normal[0];$('regularPeriod').textContent=normal[1]==='ص'?'صباحًا':'مساءً';
  if(!app.days)return;
  if(localKey(now,z)!==app.dayKey){if(!app.fetching)loadDays();return;}
  const frame=getFrame(now),phase=getPhase(now,frame);
  $('phaseTag').textContent=phase.phase==='night'?'ليل':phase.phase==='dawn'?'فجر':'نهار';
  $('currentPeriod').textContent=phase.phase==='night'?'الساعة الليلية':phase.phase==='dawn'?'وقت الفجر':'الساعة النهارية';
  $('temporalHour').textContent=phase.phase==='dawn'?'الفجر':AR_HOURS[phase.index-1];
  $('temporalFraction').textContent=phase.phase==='dawn'?'بين طلوع الفجر والشروق':`${Math.floor(phase.fraction*100)}٪ من الساعة ${AR_HOURS[phase.index-1]}`;
  const next=nextPrayer(now);
  if(next){$('nextPrayerName').textContent=next.name;$('nextPrayerTime').textContent=fmtTime(next.date,z);$('countdown').textContent=durationClock(next.date.getTime()-now.getTime());}
  const nightStart=now<app.days.today.Fajr?app.days.prev.Sunset:app.days.today.Sunset;
  const nightEnd=now<app.days.today.Fajr?app.days.today.Fajr:app.days.next.Fajr;
  $('midnightTime').textContent=fmtTime(new Date((nightStart.getTime()+nightEnd.getTime())/2),z);
  $('lastThirdTime').textContent=fmtTime(new Date(nightStart.getTime()+(nightEnd.getTime()-nightStart.getTime())*2/3),z);
  const minute=Math.floor(now.getTime()/60000);
  const key=frame.sunsetStart.getTime().toString();
  if(app.renderKey!==key){app.renderKey=key;makeDial(frame);}
  const percent=(now.getTime()-frame.sunsetStart.getTime())/(frame.sunsetEnd.getTime()-frame.sunsetStart.getTime());
  $('clockHand').setAttribute('transform',`rotate(${(Math.max(0,Math.min(1,percent))*360).toFixed(4)},250,250)`);
  if(app.lastDrawMinute!==minute){
    app.lastDrawMinute=minute;
    $('sunriseValue').textContent=fmtTime(frame.sunrise,z);
    $('sunsetValue').textContent=fmtTime(frame.sunsetEnd,z);
    $('dayLength').textContent=lengthText(frame.sunsetEnd-frame.sunrise);
    $('nightLength').textContent=lengthText(frame.fajr-frame.sunsetStart);
    showDate(now);
    renderGuidance({now,frame,phase});
    prayerListRender(now);
  }
}
function tick(){updateLive(new Date());}
function readSaved(){
  try{
    const s=JSON.parse(localStorage.getItem('miqat-settings-v2')||'null');
    if(!s||!CITIES[s.city]&&s.city!=='custom')return;
    app.selected=s.city;
    if(s.city==='custom'&&Number.isFinite(s.lat)&&Number.isFinite(s.lon)){
      app.gps={lat:s.lat,lon:s.lon,tz:s.tz||Intl.DateTimeFormat().resolvedOptions().timeZone};
      app.location={label:'موقعي الحالي',lat:s.lat,lon:s.lon,tz:app.gps.tz,method:Number(s.method)||4};
    }else if(CITIES[s.city])app.location={...CITIES[s.city]};
    app.method=Number(s.method)||app.location.method;
  }catch{}
}
function writeSaved(){
  const s={city:app.selected,lat:app.location.lat,lon:app.location.lon,tz:app.location.tz,method:app.method};
  try{localStorage.setItem('miqat-settings-v2',JSON.stringify(s))}catch{}
}
function setup(){
  readSaved();
  $('citySelect').value=app.selected;
  $('methodSelect').value=String(app.method);
  $('locationLabel').textContent='◉ '+app.location.label;
  $('openSettings').addEventListener('click',()=>{$('citySelect').value=app.selected;$('methodSelect').value=String(app.method);$('settingsMessage').textContent='';$('settingsDialog').showModal();});
  $('closeSettings').addEventListener('click',()=>$('settingsDialog').close());
  $('settingsDialog').addEventListener('click',e=>{if(e.target===$('settingsDialog'))$('settingsDialog').close();});
  $('citySelect').addEventListener('change',()=>{
    const city=$('citySelect').value;
    if(city==='custom'&&!app.gps){$('settingsMessage').textContent='اضغط «استخدام موقعي الحالي» للسماح بالوصول إلى الموقع.';return}
    if(CITIES[city])$('methodSelect').value=String(CITIES[city].method);
  });
  $('locateButton').addEventListener('click',()=>{
    if(!navigator.geolocation){$('settingsMessage').textContent='المتصفح لا يدعم تحديد الموقع.';return}
    $('settingsMessage').textContent='جارٍ الحصول على موقعك بإذنك…';
    navigator.geolocation.getCurrentPosition(pos=>{
      app.gps={lat:pos.coords.latitude,lon:pos.coords.longitude,tz:Intl.DateTimeFormat().resolvedOptions().timeZone};
      $('citySelect').value='custom';$('settingsMessage').textContent='تم تحديد الإحداثيات. اضغط «تطبيق الإعدادات».';
    },()=>{$('settingsMessage').textContent='تعذّر تحديد الموقع أو لم يُسمح بالوصول إليه. يمكنك اختيار مدينة يدويًا.'},{enableHighAccuracy:false,timeout:12000,maximumAge:120000});
  });
  $('settingsForm').addEventListener('submit',e=>{
    e.preventDefault();
    const city=$('citySelect').value;
    if(city==='custom'&&!app.gps){$('settingsMessage').textContent='حدد موقعك أولًا أو اختر مدينة.';return}
    app.selected=city;
    app.location=city==='custom'?{label:'موقعي الحالي',...app.gps}:{...CITIES[city]};
    app.method=Number($('methodSelect').value)||4;
    app.location.method=app.method;
    app.days=null;app.dayKey='';app.lastGuidanceKey='';
    writeSaved();$('settingsDialog').close();
    $('locationLabel').textContent='◉ '+app.location.label;
    loadDays(true);
  });
  $('dataStatus').addEventListener('click',()=>{if(app.lastStatus==='error')loadDays(true)});
  tick();loadDays();setInterval(tick,1000);
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)tick();});
}
window.addEventListener('DOMContentLoaded',setup);
