import crypto from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';

const endpoint = 'http://pedzi.fal0q.49493311.com/melody/api/v1/lotteryperiods/queryHisPeriodsPage';
const uuid = crypto.randomUUID();
const inner = crypto.createHash('md5').update(`${uuid}9&N4orgck9M!rh2#Wpfyg2Q!teDds8Bl`).digest('hex').toUpperCase();
const sign = crypto.createHash('md5').update(inner).digest('hex').toUpperCase();

const response = await fetch(endpoint, {
  method: 'POST',
  headers: {
    'content-type': 'application/json',
    'user-agent': 'Mozilla/5.0',
    'x-auth-uu': uuid,
    'x-auth-sign': sign,
    referer: 'http://pedzi.fal0q.49493311.com/kaicaiwang/'
  },
  body: JSON.stringify({ lotteryCode: 'AMLHC_49', limit: 5000 })
});
if (!response.ok) throw new Error(`历史接口请求失败: HTTP ${response.status}`);
const payload = await response.json();
if (payload.code !== '12200' || !payload.data?.list) throw new Error(`历史接口返回异常: ${JSON.stringify(payload)}`);

const records = payload.data.list.map((item) => ({
  issue: item.periodsNumber,
  numbers: item.drawingNumber.split(',').map(Number),
  zodiacs: item.lhcDrawingZodiac?.split(',') ?? [],
  openedAt: item.actualDrawingDate
}));
await mkdir(new URL('../src/data/', import.meta.url), { recursive: true });
await writeFile(new URL('../src/data/amlhc49-history.json', import.meta.url), `${JSON.stringify(records, null, 2)}\n`);
console.log(`已同步 ${records.length} 期 AMLHC_49 历史开奖记录`);
