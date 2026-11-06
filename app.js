
const money = n =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0
  }).format(Number(n) || 0);

let campaigns = [];

const demo = [
  ['Ventas catálogo verano', 'Meta Ads', 1850000, 8750000, 35],
  ['Búsqueda marca', 'Google Ads', 920000, 6240000, 28],
  ['Remarketing visitantes', 'Meta Ads', 640000, 3980000, 19],
  ['Prospección video', 'TikTok Ads', 780000, 1560000, 8],
  ['Shopping productos', 'Google Ads', 1250000, 7120000, 31],
  ['Campaña alcance local', 'Meta Ads', 490000, 620000, 4]
].map(([campaign, channel, spend, revenue, conversions]) => ({
  campaign,
  channel,
  spend,
  revenue,
  conversions
}));

const esc = s =>
  String(s).replace(/[&<>"']/g, c => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[c]));

function analyze() {
  if (!campaigns.length) return;

  const spend = campaigns.reduce((s, x) => s + x.spend, 0);
  const rev = campaigns.reduce((s, x) => s + x.revenue, 0);
  const conv = campaigns.reduce((s, x) => s + x.conversions, 0);
  const roas = spend ? rev / spend : 0;

  document.querySelector('#results').classList.add('show');

  document.querySelector('#rowcount').textContent =
    campaigns.length + ' campañas · Resultados calculados';

  document.querySelector('#metrics').innerHTML = [
    ['Ingresos reportados', money(rev)],
    ['Inversión total', money(spend)],
    ['ROAS agregado', roas.toFixed(2) + '×'],
    ['Costo por conversión', money(conv ? spend / conv : 0)]
  ].map(x => `
    <div class="metric">
      <small>${x[0]}</small>
      <strong>${x[1]}</strong>
    </div>
  `).join('');

  document.querySelector('#verdict').textContent =
    roas >= 3
      ? 'ROAS superior a 3×. Verifica margen y costos operativos.'
      : roas >= 1
        ? 'Los ingresos reportados superan la inversión publicitaria.'
        : 'Los ingresos reportados no cubren la inversión. Revisa tus campañas.';

  document.querySelector('#rows').innerHTML =
    [...campaigns]
      .sort((a, b) =>
        (b.spend ? b.revenue / b.spend : 0) -
        (a.spend ? a.revenue / a.spend : 0)
      )
      .map(x => `
        <tr>
          <td><strong>${esc(x.campaign)}</strong></td>
          <td>${esc(x.channel)}</td>
          <td>${money(x.spend)}</td>
          <td>${money(x.revenue)}</td>
          <td>${x.conversions}</td>
          <td><span class="tag">${(x.spend ? x.revenue / x.spend : 0).toFixed(2)}×</span></td>
          <td>${money(x.conversions ? x.spend / x.conversions : 0)}</td>
        </tr>
      `).join('');
}

function parseCSV(t) {
  const lines = t.trim().split(/\r?\n/);

  const parse = line => {
    const values = [];
    let value = '';
    let quoted = false;

    for (let i = 0; i < line.length; i++) {
      const c = line[i];

      if (c === '"' && line[i + 1] === '"' && quoted) {
        value += '"';
        i++;
      } else if (c === '"') {
        quoted = !quoted;
      } else if (c === ',' && !quoted) {
        values.push(value);
        value = '';
      } else {
        value += c;
      }
    }

    values.push(value);
    return values;
  };

  if (lines.length < 2) {
    throw Error('El archivo no tiene filas.');
  }

  const headers = parse(lines[0]).map(x => x.trim().toLowerCase());

  const ix = (...names) => headers.findIndex(x => names.includes(x));

  const ci = ix('campaign', 'campaña', 'nombre campaña');
  const ch = ix('channel', 'canal');
  const sp = ix('spend', 'inversion', 'inversión', 'cost', 'gasto');
  const rv = ix('revenue', 'ingresos', 'ventas_valor', 'valor ventas');
  const co = ix('conversions', 'conversiones', 'ventas', 'purchases', 'compras');

  if ([ci, sp, rv, co].some(x => x < 0)) {
    throw Error('Faltan columnas: campaign, spend, revenue, conversions.');
  }

  return lines.slice(1)
    .filter(x => x.trim())
    .map(line => {
      const v = parse(line);
      const num = i =>
        Number(String(v[i] || 0).replace(/[^\d.-]/g, '')) || 0;

      return {
        campaign: v[ci],
        channel: ch < 0 ? 'Sin canal' : v[ch],
        spend: num(sp),
        revenue: num(rv),
        conversions: num(co)
      };
    });
}

document.addEventListener('DOMContentLoaded', () => {

  const demoButton = document.querySelector('#demo');

  if (demoButton) {
    demoButton.onclick = () => {
      campaigns = demo.map(x => ({ ...x }));
      analyze();
    };
  }

  const fileInput = document.querySelector('#csv');

  if (fileInput) {
    fileInput.onchange = async e => {
      try {
        campaigns = parseCSV(await e.target.files[0].text());
        analyze();
      } catch (err) {
        alert(err.message);
      }
    };
  }

  const addButton = document.querySelector('#add');

  if (addButton) {
    addButton.onclick = () => {
      const campaign = document.querySelector('#name').value.trim();
      const spend = +document.querySelector('#spend').value;
      const revenue = +document.querySelector('#revenue').value;
      const conversions = +document.querySelector('#conversions').value;
      const channel =
        document.querySelector('#channel').value.trim() || 'Sin canal';

      if (!campaign || spend < 0 || revenue < 0 || conversions < 0) {
        alert('Completa el nombre y valores válidos.');
        return;
      }

      campaigns.push({
        campaign,
        channel,
        spend,
        revenue,
        conversions
      });

      analyze();
    };
  }

  const exportButton = document.querySelector('#export');

  if (exportButton) {
    exportButton.onclick = () => {
      const rows = [
        ['campaign', 'channel', 'spend_COP', 'revenue_COP', 'conversions', 'ROAS', 'CPA_COP'],
        ...campaigns.map(x => [
          x.campaign,
          x.channel,
          x.spend,
          x.revenue,
          x.conversions,
          x.spend ? (x.revenue / x.spend).toFixed(3) : 0,
          x.conversions ? (x.spend / x.conversions).toFixed(0) : 0
        ])
      ];

      const csv = rows
        .map(r => r.map(v =>
          '"' + String(v).replace(/"/g, '""') + '"'
        ).join(','))
        .join('\n');

      const url = URL.createObjectURL(
        new Blob(['\ufeff' + csv], {
          type: 'text/csv;charset=utf-8'
        })
      );

      const link = document.createElement('a');
      link.href = url;
      link.download = 'atributia-resultados.csv';
      link.click();

      URL.revokeObjectURL(url);
    };
  }

  const loginForm = document.querySelector('#loginform');

  if (loginForm) {
    loginForm.onsubmit = e => {
      e.preventDefault();

      const email = document.querySelector('#email').value;

      localStorage.setItem('atributia_demo_profile', email);

      document.querySelector('#authmsg').textContent =
        `Perfil local guardado para ${email}. No se creó una cuenta en servidor.`;
    };
  }

});
