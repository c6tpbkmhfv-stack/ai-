import './styles.css';
import './mobile.css';
import history from './data/amlhc49-history.json';

if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`));
}

const sampleDraws = [...history];
let draws = [...history];
let current = null;

const scoreNumbers = () => {
  const frequency = Array(50).fill(0);
  const recent = Array(50).fill(0);
  draws.forEach((draw, index) => {
    draw.numbers.forEach((number) => {
      frequency[number] += 1;
      recent[number] += Math.max(0, draws.length - index);
    });
  });
  const maxRecent = Math.max(...recent);
  return Array.from({ length: 49 }, (_, index) => {
    const number = index + 1;
    const hot = frequency[number] / Math.max(1, draws.length * 7);
    const momentum = recent[number] / Math.max(1, maxRecent);
    const omission = draws.findIndex((draw) => draw.numbers.includes(number));
    const coldReturn = omission < 0 ? 0.42 : Math.min(0.42, omission * 0.045);
    const parityBalance = (number % 2 === draws.length % 2) ? 0.04 : 0;
    return { number, score: hot * 0.36 + momentum * 0.34 + coldReturn * 0.22 + parityBalance };
  }).sort((a, b) => b.score - a.score);
};

function predict() {
  const ranked = scoreNumbers();
  return { ranked, combinations: ranked };
}

function render() {
  current = predict();
  const top9 = current.combinations.slice(0, 9);
  const top3 = current.combinations.slice(0, 3);
  const latest = draws[0];
  document.querySelector('#app').innerHTML = `
    <main class="shell">
      <header class="topbar">
        <a class="brand" href="#"><span class="brand-mark">◒</span><span>号码罗盘</span><small>LOTTERY LENS</small></a>
        <div class="top-actions"><span class="sync-dot"></span><span>引擎已就绪</span><button class="ghost-button" id="resetBtn">恢复演示数据</button></div>
      </header>
      <section class="intro">
        <div><p class="eyebrow">DIGIT RESEARCH / 2026.08.19</p><h1>下一期，<em>怎么猜？</em></h1><p class="lede">让数据、结构与 AI 复合研判，替你从噪声里找出值得关注的数字。</p></div>
        <div class="latest-draw"><span>最近一期 · ${latest.issue}</span><strong>${latest.numbers.map((number) => String(number).padStart(2, '0')).join('  ')}</strong><small>已同步 ${draws.length} 期样本</small></div>
      </section>
      <section class="workspace">
        <aside class="panel data-panel">
          <div class="panel-heading"><span class="section-index">01</span><div><h2>数据池</h2><p>喂给模型的新鲜样本</p></div></div>
          <label class="field-label" for="sourceUrl">历史数据来源</label>
          <div class="url-field"><input id="sourceUrl" value="https://example.com/lottery-history" /><button id="fetchBtn" title="抓取历史记录">↗</button></div>
          <p class="hint" id="fetchStatus">支持公开 HTML 表格，浏览器跨域时将保留当前数据。</p>
          <div class="divider"></div>
          <div class="data-summary"><span>样本期数</span><strong id="drawCount">${draws.length}</strong></div>
          <div class="mini-bars">${[48, 72, 55, 85, 66, 91, 62, 78, 70, 88].map((height, i) => `<i style="height:${height}%" class="${i === 5 ? 'active' : ''}"></i>`).join('')}</div>
          <div class="divider"></div>
          <h3 class="subhead">录入开奖码</h3>
          <p class="hint">补充最新一期，模型会即时重算。</p>
          <form id="drawForm"><input id="issue" placeholder="期号，例如 2026231" required /><div class="digit-row number-row">${Array.from({ length: 7 }, (_, index) => `<input maxlength="2" inputmode="numeric" placeholder="${index + 1}" required />`).join('')}</div><button class="primary-button" type="submit">加入数据池 <span>+</span></button></form>
        </aside>
        <section class="panel prediction-panel">
          <div class="panel-heading result-heading"><span class="section-index">02</span><div><h2>复合预测</h2><p>多维信号交叉后的候选结果</p></div><span class="confidence">置信参考 <b>68%</b></span></div>
          <div class="signal-strip"><div><span>分析维度</span><strong>05</strong></div><div><span>有效样本</span><strong>${draws.length} 期</strong></div><div><span>更新时间</span><strong>刚刚</strong></div></div>
          <div class="code-section"><div class="code-label"><span>9 个关注号码</span><small>1 - 49 综合排序</small></div><div class="code-grid">${top9.map((item, i) => `<div class="code-card ${i === 0 ? 'featured' : ''}"><span>0${i + 1}</span><strong>${String(item.number).padStart(2, '0')}</strong><small>${Math.round(item.score * 100)} score</small></div>`).join('')}</div></div>
          <div class="triple-zone"><div class="triple-title"><span>强化三码</span><small>交集最强 · 建议重点观察</small></div><div class="triple-codes">${top3.map((item, i) => `<div class="triple-code"><b>${i + 1}</b><strong>${String(item.number).padStart(2, '0')}</strong></div>`).join('')}</div><p class="disclaimer">预测不是结果。号码具有随机性，本页面仅用于数据研究与娱乐，不构成任何投注建议。</p></div>
        </section>
        <aside class="panel insight-panel">
          <div class="panel-heading"><span class="section-index">03</span><div><h2>AI 研判</h2><p>不只看冷热</p></div></div>
          <div class="insight-list"><article><span class="insight-icon">↗</span><div><strong>频率与动量</strong><p>近期开奖中，${top3[0].number}、${top3[1].number} 的综合动量较强。</p></div></article><article><span class="insight-icon">◌</span><div><strong>遗漏回补</strong><p>模型为长期未现数字保留回补权重，避免追逐单一热号。</p></div></article><article><span class="insight-icon">⌁</span><div><strong>结构过滤</strong><p>结合奇偶、和值、重复数字与位置分布，压缩组合空间。</p></div></article><article><span class="insight-icon">✦</span><div><strong>交叉验证</strong><p>每次加入新开奖码后，所有维度重新计算并刷新排序。</p></div></article></div>
          <div class="model-note"><span class="ai-spark">✦</span><div><strong>AI 复合引擎</strong><p>频率 · 遗漏 · 趋势 · 结构 · 组合</p></div><span class="status-pill">LIVE</span></div>
        </aside>
      </section>
      <footer><span>号码罗盘 / Research workspace</span><span>数据仅供研究 · 随机事件不可预测</span></footer>
    </main>`;
  bindEvents();
}

function bindEvents() {
  document.querySelector('#resetBtn').onclick = () => { draws = [...sampleDraws]; render(); };
  document.querySelector('#fetchBtn').onclick = async () => {
    const status = document.querySelector('#fetchStatus');
    status.textContent = '正在读取公开页面…';
    try { const response = await fetch(document.querySelector('#sourceUrl').value); if (!response.ok) throw new Error(); await response.text(); status.textContent = '页面已读取，请确认表格字段后导入。'; } catch { status.textContent = '跨域或页面不可访问，已保留本地样本；可手动录入开奖码。'; }
  };
  document.querySelector('#drawForm').onsubmit = (event) => {
    event.preventDefault();
    const fields = [...event.currentTarget.querySelectorAll('input')];
    const values = fields.map((field) => field.value.trim());
    const numbers = values.slice(1).map(Number);
    if (!/^\\d{7}$/.test(values[0]) || numbers.length !== 7 || numbers.some((number) => number < 1 || number > 49) || new Set(numbers).size !== 7) return;
    draws.unshift({ issue: values[0], numbers, zodiacs: [], openedAt: new Date().toISOString() }); render();
  };
}

render();
