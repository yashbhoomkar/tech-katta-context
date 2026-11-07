// Scores a vague answer (no real requirement named) against every problem's written-requirement keywords.
// Run with tech-katta checked out beside this repo: node tools/audit/fr-vague-answer.mjs. Expect 3 of 101 or fewer.
import fs from 'fs';import{gradeAnswer}from'../../../tech-katta/frontend/src/judge/judge.js';
const D=new URL('../../../tech-katta/',import.meta.url).pathname+'content/articles/interview-questions/';
const junk="Users can open the app and see their data, with live status, on time, at once, in order. It should be fast, reliable and scale. Support cities across India. Output the results to the user and store them together.";
let tot=0,hit=0;
for(const f of fs.readdirSync(D)){const P=JSON.parse(fs.readFileSync(D+f)).practice;if(!P)continue;
 const g=gradeAnswer({fr:junk},P.rubric);const ok=g.fr.filter(x=>x.ok);tot+=g.fr.length;hit+=ok.length;
 if(ok.length) console.log(f.replace('.json','').padEnd(20),`${ok.length}/${g.fr.length}:`,ok.map(x=>x.label).join(' | '))}
console.log(`generic answer earned ${hit} of ${tot} requirement ticks`);
