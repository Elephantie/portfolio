const grid = document.querySelector('#project-grid');
const dialog = document.querySelector('#project-dialog');
const content = document.querySelector('#dialog-content');
const url = path => path.split('/').map(encodeURIComponent).join('/');
const esc = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let opener;
const imageOrType = p => p.cover ? `<img loading="lazy" src="${url(p.cover)}" alt="${esc(p.title)}作品局部预览">` : `<span class="cover-type">${esc(p.graphic||p.title)}</span>`;
const card = p => `<button class="project-card" data-id="${p.id}" aria-label="查看：${esc(p.title)}"><div class="project-cover ${p.tone} ${p.coverStyle||''}${p.mediaType==='video'?' video-cover':''}"><span class="cover-index">${(p.files[0]?.[1] || '').endsWith('.mp4')?'VIDEO':(p.files[0]?.[1] || '').endsWith('.pdf')?'PDF':p.mediaType==='article'?'公众号原文':p.mediaType==='text'?'项目介绍':'图文作品'}</span>${imageOrType(p)}${p.durationLabel?`<span class="video-duration">${p.durationLabel}</span>`:''}<span class="cover-arrow" aria-hidden="true">${p.files.some(([,f])=>/\.mp4$/i.test(f))?'▷':'↗'}</span></div><div class="card-body">${p.role?`<span class="role-tag">${esc(p.role)}</span>`:''}<h3>${esc(p.title)}</h3><p>${esc(p.summary)}</p>${p.disclosure?`<p class="project-disclosure">${esc(p.disclosure)}</p>`:''}<span class="card-action">${p.files.some(([,f])=>/\.mp4$/i.test(f))?'播放这支作品':p.originalUrl?'阅读公众号原文':p.mediaType==='text'?'阅读项目介绍':p.mediaType==='video'?'查看作品介绍':'查看完整作品'} ↗</span></div></button>`;
const groups = c => {const ps=projects.filter(p=>p.category===c.id);return [...new Set(ps.map(p=>p.group||''))].map(group=>`<div class="work-subgroup">${group?`<h4 class="subgroup-title">${esc(group)} <span>${ps.filter(p=>(p.group||'')===group).length} 件</span></h4>`:''}<div class="project-grid">${ps.filter(p=>(p.group||'')===group).map(card).join('')}</div></div>`).join('');};
grid.innerHTML=categories.map((c,i)=>`<section class="work-section" id="works-${c.id}" data-category="${c.id}"><div class="category-heading"><div><div class="eyebrow">${String(i+1).padStart(2,'0')} / ${c.en}</div><h3>${c.name}<span>${projects.filter(p=>p.category===c.id).length} 件</span></h3><p>${c.intro}</p></div><span class="category-note">${c.note}</span></div>${groups(c)}</section>`).join('');
document.querySelector('.filters').innerHTML='<button class="active" data-filter="all" aria-pressed="true">全部类型</button>'+categories.map(c=>`<button data-filter="${c.id}" aria-pressed="false">${c.name}</button>`).join('');
document.querySelectorAll('[data-filter]').forEach(button=>button.addEventListener('click',()=>{document.querySelectorAll('[data-filter]').forEach(b=>{b.classList.toggle('active',b===button);b.setAttribute('aria-pressed',String(b===button));});document.querySelectorAll('.work-section').forEach(section=>section.hidden=button.dataset.filter!=='all'&&section.dataset.category!==button.dataset.filter);}));
grid.addEventListener('click',event=>{
 const trigger=event.target.closest('[data-id]');if(!trigger)return;opener=trigger;
 const p=projects.find(p=>p.id===trigger.dataset.id), c=categories.find(c=>c.id===p.category);
 if(p.mediaType==='article'&&/^https:\/\//i.test(p.originalUrl||'')){window.open(p.originalUrl,'_blank','noopener,noreferrer');return;}
 content.innerHTML=`<div class="eyebrow">${c.name}${p.group?' / '+p.group:''}</div><h2 id="dialog-title">${esc(p.title)}</h2>${p.role?`<p class="detail-meta">我的职责 / ${esc(p.role)}</p>`:''}<p class="detail-copy">${esc(p.description)}</p>${p.facts.length?`<dl class="detail-copy">${p.facts.map(([label,value])=>`<dt>${esc(label)}</dt><dd>${esc(value)}</dd>`).join('')}</dl>`:''}${p.disclosure?`<p class="project-disclosure">${esc(p.disclosure)}</p>`:''}<div class="file-links">${p.originalUrl&&/^https:\/\//i.test(p.originalUrl)?`<a class="original-link" href="${esc(p.originalUrl)}" target="_blank" rel="noopener noreferrer">阅读原文 ↗</a>`:''}${p.files.map(([name,path])=>`<a href="${url(path)}" target="_blank" rel="noopener">${esc(name)} ↗</a>`).join('')}</div>`;
 const file=(p.files[0]?.[1] || '');
 if(/\.mp4$/i.test(file))content.insertAdjacentHTML('beforeend',`<video controls playsinline preload="metadata" ${p.cover?`poster="${url(p.cover)}"`:''} src="${url(file)}">请通过上方链接打开视频。</video><p class="detail-meta">若浏览器无法播放，可通过上方链接使用本地播放器观看。</p>`);
 else if(/\.(png|jpg)$/i.test(file))content.insertAdjacentHTML('beforeend',`<img class="full-image" src="${url(file)}" alt="${esc(p.title)}完整作品">`);
 else if(/\.pdf$/i.test(file))content.insertAdjacentHTML('beforeend',`<object class="pdf-preview" data="${url(file)}" type="application/pdf"><p>请点击上方链接阅读完整 PDF。</p></object>`);
 dialog.showModal();dialog.scrollTop=0;document.body.style.overflow='hidden';
});
document.querySelector('#close-dialog').addEventListener('click',()=>dialog.close());
dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}});
dialog.addEventListener('close',()=>{content.querySelectorAll('video').forEach(v=>{v.pause();v.removeAttribute('src');v.load();});content.innerHTML='';document.body.style.overflow='';opener?.focus();});
const printRoot=document.querySelector('#print-portfolio');
if(printRoot){
  const renderCard=p=>{
    const isVideo=p.mediaType==='video'||p.files.some(([,f])=>/\.mp4$/i.test(f));
    const isPdf=p.files.some(([,f])=>/\.pdf$/i.test(f));
    const badgeText=isVideo?'视频作品 · 可在线播放':isPdf?'完整 PDF · 可在线阅读':p.mediaType==='article'?'微信公众号原文':p.mediaType==='text'?'项目策划':'图文作品';
    let mediaHtml='';
    if(p.cover){
      mediaHtml=`<div class="print-card-media ${isVideo?'is-video':''}"><img src="${url(p.cover)}" alt="${esc(p.title)}">${p.durationLabel?`<span class="media-dur">${p.durationLabel}</span>`:''}</div>`;
    }else if(p.graphic||p.title){
      mediaHtml=`<div class="print-card-media placeholder ${p.tone||'lilac'}"><span>${esc(p.graphic||p.title)}</span></div>`;
    }
    const factsHtml=p.facts&&p.facts.length?`<div class="print-facts">${p.facts.map(([k,v])=>`<div class="print-fact"><b>${esc(k)}：</b><span>${esc(v)}</span></div>`).join('')}</div>`:'';
    return `<article class="print-card ${!p.cover&&!p.graphic?'text-only':''}">
      ${mediaHtml}
      <div class="print-card-body">
        <div class="print-card-header">
          ${p.group?`<span class="print-group-tag">${esc(p.group)}</span>`:''}
          <h4 class="print-card-title">${esc(p.title)}</h4>
          ${p.role?`<span class="print-role-badge">职责：${esc(p.role)}</span>`:''}
        </div>
        ${p.summary?`<p class="print-card-summary">${esc(p.summary)}</p>`:''}
        ${p.description&&p.description!==p.summary?`<p class="print-card-desc">${esc(p.description)}</p>`:''}
        ${factsHtml}
        ${p.disclosure?`<div class="print-card-disclosure">${esc(p.disclosure)}</div>`:''}
        <div class="print-card-footer">
          <span class="badge-type">${badgeText}</span>
          <span class="badge-link">portfolio-na8.pages.dev ↗</span>
        </div>
      </div>
    </article>`;
  };

  const renderCategory=(c,idx)=>{
    const ps=projects.filter(p=>p.category===c.id);
    if(!ps.length)return '';
    const groups=[...new Set(ps.map(p=>p.group||''))];
    let cardsHtml='';
    if(groups.length>1||(groups.length===1&&groups[0])){
      cardsHtml=groups.map(g=>`
        <div class="print-subgroup">
          ${g?`<h4 class="print-subgroup-title">${esc(g)} <span>(${ps.filter(p=>(p.group||'')===g).length} 件)</span></h4>`:''}
          <div class="print-cards-flow">
            ${ps.filter(p=>(p.group||'')===g).map(renderCard).join('')}
          </div>
        </div>
      `).join('');
    }else{
      cardsHtml=`<div class="print-cards-flow">${ps.map(renderCard).join('')}</div>`;
    }
    return `<section class="print-cat-section" data-cat="${c.id}">
      <div class="print-cat-head">
        <div class="print-cat-num">${String(idx+1).padStart(2,'0')}</div>
        <div class="print-cat-titles">
          <h3 class="print-cat-name">${esc(c.name)}</h3>
          <span class="print-cat-meta">${esc(c.en)} · ${esc(c.note)}</span>
        </div>
        <div class="print-cat-badge">${ps.length} 件实践</div>
      </div>
      ${c.intro?`<p class="print-cat-intro">${esc(c.intro)}</p>`:''}
      ${cardsHtml}
    </section>`;
  };

  printRoot.innerHTML=`
    <div class="print-cover">
      <div class="print-topbar">
        <span class="topbar-brand">GUO XIANGNI / PORTFOLIO</span>
        <span class="topbar-motto">观察 · 表达 · 连接 · 持续探索</span>
      </div>
      <div class="print-hero">
        <h1 class="hero-name">郭湘妮</h1>
        <p class="hero-tagline">从一个个想法，到一次次实践</p>
        <p class="hero-edu">
          <b>南京师范大学</b> · 新闻学（全媒体运营方向） · 2023.09 — 2027.06 · 本科在读
        </p>
        <div class="hero-contacts">
          <span>📧 3381613703@qq.com</span>
          <span>📱 156-7333-5126</span>
          <span>🌐 https://portfolio-na8.pages.dev</span>
        </div>
      </div>
      <div class="print-catalog">
        <div class="catalog-title">实践全景 / PORTFOLIO ARCHIVE (${categories.length} 类作品 · ${projects.length} 件实践)</div>
        <div class="catalog-grid">
          ${categories.map((c,i)=>`
            <div class="catalog-item">
              <span class="cat-idx">${String(i+1).padStart(2,'0')}</span>
              <div class="cat-info">
                <strong>${esc(c.name)}</strong>
                <small>${esc(c.note)} · ${projects.filter(p=>p.category===c.id).length} 件</small>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
      <div class="print-highlights">
        <div class="hl-col">
          <b>01 观察与策划</b>
          <p>从具体需求与用户洞察出发，完成产品/IP 宣传规划、选题构思与脚本分镜设计。</p>
        </div>
        <div class="hl-col">
          <b>02 内容采编与视觉表达</b>
          <p>采写、图文排版、长图设计与视频剪辑，熟练运用 PS、Canva、PR、剪映完成一体化呈现。</p>
        </div>
        <div class="hl-col">
          <b>03 AI 深度应用与落地</b>
          <p>熟练运用 AI 图像与视频生成模型，搭建自动化提示词工作流并落地为可交互网页产品。</p>
        </div>
      </div>
      <div class="print-cover-foot">
        <span>* 注：微信/手机直接访问 portfolio-na8.pages.dev 可在线播放视频并体验交互效果。</span>
        <span>第 1 页</span>
      </div>
    </div>
    <div class="print-body">
      ${categories.map(renderCategory).join('')}
    </div>
  `;
}
document.querySelectorAll('.print-button').forEach(b=>b.addEventListener('click',()=>window.print()));
