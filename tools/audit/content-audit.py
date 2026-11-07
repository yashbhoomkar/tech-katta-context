# Cross-checks every Interview Question's tabs (tests, rubric, hints, decisions) against each other and the
# worked answer. Prints findings per problem; empty output after the summary line means nothing found.
# Usage: python3 tools/audit/content-audit.py   (reads the tech-katta clone next to this repo, or TK_CONTENT)
import json,re,os,sys
ROOT=os.environ.get('TK_CONTENT') or os.path.join(os.path.dirname(os.path.abspath(__file__)),'../../../tech-katta/content')
D=os.path.join(ROOT,'articles/interview-questions')+'/'
LAB=json.load(open(os.path.join(ROOT,'lab.json')))
def num(s):
    s=s.replace(',','').strip()
    m=re.match(r'([\d.]+)\s*(lakh|crore|thousand|million|k)?',s)
    if not m: return None
    v=float(m.group(1));u=m.group(2)
    return v*{'lakh':1e5,'crore':1e7,'thousand':1e3,'million':1e6,'k':1e3,None:1}[u]
def hour(s):
    m=re.match(r'(\d{1,2})(?::(\d\d))?\s*(am|pm)',s)
    if not m: return None
    h=int(m.group(1))%12+(12 if m.group(3)=='pm' else 0);return h+(int(m.group(2) or 0)/60)
def text_of(b):
    out=[]
    def walk(v):
        if isinstance(v,str): out.append(v)
        elif isinstance(v,list): [walk(x) for x in v]
        elif isinstance(v,dict): [walk(x) for k,x in v.items() if k not in ('t','to','id','fig')]
    walk(b);return ' '.join(out)
issues={}
def flag(slug,where,msg): issues.setdefault(slug,[]).append(f'[{where}] {msg}')
longest_right=0;total_dec=0
for f in sorted(os.listdir(D)):
    a=json.load(open(D+f));P=a.get('practice')
    if not P: continue
    s=a['slug'];art=' '.join(text_of(b) for b in a['body'])
    # A: tests vs settings
    for t in P['tests']:
        w='test '+t['id']; d=t.get('desc','')
        if t.get('request'): continue
        rps=t['traffic']['rps']
        for m in re.finditer(r'([\d,.]+\s*(?:lakh|crore|thousand|million|k)?)\s*(?:requests|req|searches|messages|views|swipes|events|calls|bookings|uploads|reads|writes|redirects|clicks|orders|payments|plays|lookups|queries|updates|pings|jobs|pages|keystrokes|edits)[^.]{0,20}?(?:a|per)\s*second',d):
            v=num(m.group(1))
            if v and abs(v-rps)/rps>0.02: flag(s,w,f'desc says {m.group(0)!r} but traffic.rps = {rps:,}')
        hm=re.search(r'\b(?:at|from)\s+(\d{1,2}(?::\d\d)?\s*(?:am|pm))',d)
        if hm:
            h=hour(hm.group(1))
            if h is not None and abs(h-t['startHour'])>0.01: flag(s,w,f'desc says {hm.group(0)!r} but startHour = {t["startHour"]}')
        hh=re.search(r'for (an|one|two|three|four|six|\d+) hours?',d)
        if hh:
            n={'an':1,'one':1,'two':2,'three':3,'four':4,'six':6}.get(hh.group(1)) or int(hh.group(1))
            if n!=t['hours']: flag(s,w,f'desc says {hh.group(0)!r} but hours = {t["hours"]}')
        if re.search(r'crash|goes down|dies|outage|kill',d,re.I) and not t.get('chaos') and not re.search(r'nothing crashes|no crash|without crash|doesn.t crash|or crash',d,re.I): flag(s,w,f'desc mentions a failure but the test has no chaos: {d!r}')
        if t.get('chaos') and not re.search(r'crash|fail|down|dies|outage|kill|lost|break',d,re.I): flag(s,w,f'test injects {t["chaos"]} but desc never says so: {d!r}')
        for c in t['checks']:
            L=c.get('label','')
            if c['kind']=='availability':
                m=re.search(r'([\d.]+)\s*%',L)
                if not m or float(m.group(1))!=c['min']: flag(s,w,f'label {L!r} vs min {c["min"]}')
            if c['kind']=='p99':
                m=re.search(r'([\d,]+)\s*ms',L)
                if not m or int(m.group(1).replace(',',''))!=c['max']: flag(s,w,f'label {L!r} vs max {c["max"]}')
            if c['kind']=='cost':
                m=re.search(r'\$([\d,]+)',L)
                if not m or int(m.group(1).replace(',',''))!=c['max']: flag(s,w,f'label {L!r} vs max {c["max"]}')
            if not L: flag(s,w,f'check {c} has no label')
    samples=[t for t in P['tests'] if t.get('sample')]
    if not samples: flag(s,'tests','no example tests')
    # brief vs fixed
    fx=P.get('fixed',{}) ;b=P['brief']
    m=re.search(r'(\d+) in 10',b)
    if m and 'hitPct' in fx and int(m.group(1))*10!=fx['hitPct']: flag(s,'brief',f'{m.group(0)!r} vs hitPct {fx["hitPct"]}')
    m=re.search(r'([\d,]+) (?:\w+ ){0,3}for every (?:new )?\w+',b)
    if m and 'writePct' in fx:
        n=int(m.group(1).replace(',',''));
        if abs(100/(n+1)-fx['writePct'])>max(0.5,fx['writePct']*0.3): flag(s,'brief',f'{m.group(0)!r} vs writePct {fx["writePct"]}')
    # rubric
    R=P['rubric']
    for e in R['est']:
        ans=e['answer']
        cands={f'{ans:,}',str(ans)}
        if ans>=1e5 and ans<1e7: cands|={f'{ans/1e5:g} lakh'}
        if ans>=1e7: cands|={f'{ans/1e7:g} crore'}
        if ans>=1e3: cands|={f'{ans/1e3:g} thousand',f'{ans/1e3:g}k',f'{ans/1e3:g},000'}
        if ans>=1e6: cands|={f'{ans/1e6:g} million'}
        if not any(c in art for c in cands): flag(s,'answer est',f'{e["label"]} = {ans} {e["unit"]} not found in the worked answer (how: {e.get("how")})')
    reqs=[t for t in P['tests'] if t.get('request')]
    for t in reqs:
        ok=any(t['request']['method'] in api['method'].split('|') and re.search(api['path'],t['request']['path'].split('?')[0]) for api in R['api'])
        if not ok: flag(s,'api',f'request test {t["request"]["method"]} {t["request"]["path"]} matches no graded rubric API (fine unless it is a core call)')
    # article API code block paths vs rubric
    for b in a['body']:
        if b['t']=='code':
            for m in re.finditer(r'\b(GET|POST|PUT|PATCH|DELETE)\s+(/\S+)',b.get('x','') if isinstance(b.get('x'),str) else text_of(b)):
                p=m.group(2).split('?')[0].rstrip(',;')
                if not any(m.group(1) in api['method'].split('|') and re.search(api['path'],p) for api in R['api']):
                    flag(s,'api',f'article API {m.group(1)} {p} is not graded by the rubric (fine for an extra call, a problem for a core one)')
    nf=R.get('nfr',{})
    for t in P['tests']:
        for c in t.get('checks',[]):
            if c['kind']=='p99' and 'p99' in nf and c['max']>nf['p99'][1]*1.01: flag(s,'nfr',f'test {t["id"]} p99 {c["max"]} > rubric p99 range {nf["p99"]}')
    for i,d in enumerate(R.get('decisions',[])):
        total_dec+=1
        L=[len(o) for o in d['options']]
        if d['answer']>=len(d['options']): flag(s,'decisions',f'{d["id"]} answer out of range')
        if L[d['answer']]==max(L) and L.count(max(L))==1 and max(L)>1.4*sorted(L)[-2]: longest_right+=1;flag(s,'decisions',f'{d["id"]}: the right answer is by far the longest option ({L}) — a giveaway')
    # hints
    H=P['hints']
    if not (5<=len(H)<=8): flag(s,'hints',f'{len(H)} hints')
    # hygiene
    blob=json.dumps(a,ensure_ascii=False)
    for pat in ['TODO','TBD','lorem','undefined','NaN','  ','..','\\u00a0',' ,']:
        for m in re.finditer(re.escape(pat),blob):
            ctx=blob[max(0,m.start()-40):m.end()+40]
            if pat=='..' and ('...' in ctx or re.search(r'\d\.\.\d',ctx) or 'http' in ctx): continue
            flag(s,'text',f'{pat!r} in …{ctx}…');break
print(f'decisions where the right answer is by far the longest: {longest_right} of {total_dec}')
for s,L in issues.items():
    print(f'\n== {s} ({len(L)})');[print('  '+x) for x in L]
