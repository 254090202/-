/* 书循环 BookLoop — 校园二手书统一收售平台（纯前端原型） */
(function () {
  'use strict';

  /* ================= 常量 ================= */
  const STORAGE_KEY = 'bookloop.db.v1';
  const SELLER_RATE = 0.65;          // 卖家分账比例
  const DELIVERY_FEE = 2;
  const DAY = 86400000;

  const CATEGORIES = ['全部', '计算机', '数学', '外语', '经济管理', '文学', '理工', '考研'];
  const FORM_CATEGORIES = CATEGORIES.filter(function (c) { return c !== '全部'; });
  const CONDS = ['A', 'B', 'C'];
  const COND_META = {
    A: { name: '九成新', desc: '无笔记或极少划线，无折损' },
    B: { name: '八成新', desc: '少量笔记，边角轻微磨损' },
    C: { name: '七成新', desc: '笔记较多，可能有折页或旧痕' }
  };
  const CAMPUSES = ['东校区', '西校区', '南校区'];
  const SELLERS = ['林同学', '周同学', '许同学', '陈同学', '赵同学', '何同学', '吴同学', '郑同学'];
  const COVER_PALETTES = [
    ['#12433c', '#1d6d5e'],
    ['#1f3358', '#35598f'],
    ['#6d3521', '#95523a'],
    ['#4b2d55', '#7a4c83'],
    ['#3f4a24', '#6b7c3d'],
    ['#33424b', '#5a717d'],
    ['#6b4a1d', '#9c7638'],
    ['#4a1f2c', '#7d3a4c']
  ];

  const ME = { name: '陈同学', studentId: '2023110245', campus: '东校区' };

  const SEED_BOOKS = [
    { title: '数据结构与算法分析（C 语言版）', author: 'Mark Allen Weiss', publisher: '机械工业出版社', edition: '第 2 版', isbn: '9787111544937', category: '计算机', listPrice: 89, priceA: 45, desc: '计算机专业核心教材，图与排序章节讲解扎实，课后习题配套完整。' },
    { title: '计算机网络：自顶向下方法', author: 'James F. Kurose', publisher: '机械工业出版社', edition: '第 7 版', isbn: '9787111593356', category: '计算机', listPrice: 89, priceA: 42, desc: '网络课经典教材，自顶向下的讲解路径很适合入门与复习。' },
    { title: '深入理解计算机系统', author: 'Randal E. Bryant', publisher: '机械工业出版社', edition: '第 3 版', isbn: '9787111544950', category: '计算机', listPrice: 139, priceA: 68, desc: 'CSAPP，体系结构与系统编程必读书，书内有少量重点标注。' },
    { title: '高等数学（上册）', author: '同济大学数学系', publisher: '高等教育出版社', edition: '第八版', isbn: '9787040396638', category: '数学', listPrice: 49.8, priceA: 26, desc: '大一理工科通用教材，附赠手写公式整理页。' },
    { title: '线性代数', author: '同济大学数学系', publisher: '高等教育出版社', edition: '第七版', isbn: '9787040396614', category: '数学', listPrice: 39.8, priceA: 20, desc: '线代入门标准教材，例题与习题覆盖考试重点。' },
    { title: '概率论与数理统计', author: '盛骤 等', publisher: '高等教育出版社', edition: '第五版', isbn: '9787040516593', category: '数学', listPrice: 45, priceA: 22, desc: '浙大版概率论教材，课后答案齐全。' },
    { title: '大学英语四级真题详解', author: '张剑', publisher: '外语教学与研究出版社', edition: '2025 版', isbn: '9787521340020', category: '外语', listPrice: 59.8, priceA: 24, desc: '近十年四级真题，含听力二维码，笔记较少。' },
    { title: '新概念英语 3', author: 'L.G. Alexander', publisher: '外语教学与研究出版社', edition: '新版', isbn: '9787560022581', category: '外语', listPrice: 39.9, priceA: 18, desc: '经典进阶教材，适合大二英语拓展课使用。' },
    { title: '经济学原理（微观分册）', author: 'N. Gregory Mankiw', publisher: '北京大学出版社', edition: '第 8 版', isbn: '9787301297605', category: '经济管理', listPrice: 78, priceA: 38, desc: '曼昆经济学入门，案例丰富，适合零基础精读。' },
    { title: '管理学', author: '斯蒂芬·罗宾斯', publisher: '中国人民大学出版社', edition: '第 13 版', isbn: '9787300271507', category: '经济管理', listPrice: 79, priceA: 36, desc: '经管类专业基础课教材，重点章节有荧光笔标注。' },
    { title: '西方经济学（宏观部分）', author: '高鸿业', publisher: '中国人民大学出版社', edition: '第 7 版', isbn: '9787300248691', category: '经济管理', listPrice: 45, priceA: 22, desc: '考研与期末常用教材，配套习题册一并寄售。' },
    { title: '中国文学史（第一卷）', author: '袁行霈', publisher: '高等教育出版社', edition: '第三版', isbn: '9787040391596', category: '文学', listPrice: 36.8, priceA: 18, desc: '中文系必修教材，扉页有前任读者签名，内页干净。' },
    { title: '大学物理学（上册）', author: '程守洙', publisher: '高等教育出版社', edition: '第六版', isbn: '9787040264982', category: '理工', listPrice: 48, priceA: 23, desc: '工科物理通用教材，力学与热学部分完整。' },
    { title: '考研政治核心考案', author: '徐涛', publisher: '中国政法大学出版社', edition: '2026 版', isbn: '9787562099459', category: '考研', listPrice: 69.8, priceA: 28, desc: '考研政治冲刺核心资料，附赠背诵手册。' },
    { title: 'Python 编程：从入门到实践', author: 'Eric Matthes', publisher: '人民邮电出版社', edition: '第 3 版', isbn: '9787115612069', category: '计算机', listPrice: 89, priceA: 40, desc: '零基础 Python 入门，项目章节完整，代码可直接运行。' }
  ];

  /* ================= 工具函数 ================= */
  let seq = 0;
  function uid(prefix) {
    seq += 1;
    return prefix + '_' + Date.now().toString(36) + seq.toString(36);
  }
  function esc(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function yuan(n) {
    const v = Math.round((Number(n) || 0) * 10) / 10;
    return '¥' + (Number.isInteger(v) ? String(v) : v.toFixed(1));
  }
  function pad(n) { return n < 10 ? '0' + n : String(n); }
  function iso(ms) { return new Date(ms).toISOString(); }
  function fmtDate(str) {
    if (!str) return '—';
    const d = new Date(str);
    return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
  }
  function fmtShort(str) {
    if (!str) return '—';
    const d = new Date(str);
    return pad(d.getMonth() + 1) + '-' + pad(d.getDate()) + ' ' + pad(d.getHours()) + ':' + pad(d.getMinutes());
  }
  function round2(n) { return Math.round((n + Number.EPSILON) * 100) / 100; }

  let toastTimer = null;
  function toast(msg) {
    const el = document.getElementById('toast');
    if (!el) return;
    el.textContent = msg;
    el.classList.add('show');
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.classList.remove('show'); }, 2800);
  }

  /* ================= 种子数据 ================= */
  function seed() {
    const now = Date.now();
    const books = SEED_BOOKS.map(function (b, i) {
      return {
        id: 'b' + (i + 1),
        palette: i % COVER_PALETTES.length,
        title: b.title,
        author: b.author,
        publisher: b.publisher,
        edition: b.edition,
        isbn: b.isbn,
        category: b.category,
        listPrice: b.listPrice,
        priceA: b.priceA,
        desc: b.desc
      };
    });

    const copies = [];
    const pricing = {};
    const orders = [];
    let copySeq = 0;

    function mkCopy(bookId, cond, status, seller, campus, daysAgo, soldPriceVal) {
      copySeq += 1;
      return {
        id: 'sc' + copySeq,
        bookId: bookId,
        condition: cond,
        status: status,
        seller: seller,
        campus: campus,
        expectedPrice: null,
        soldPrice: soldPriceVal == null ? null : soldPriceVal,
        soldAt: soldPriceVal == null ? null : iso(now - Math.max(0.2, daysAgo - 1) * DAY),
        createdAt: iso(now - daysAgo * DAY)
      };
    }

    books.forEach(function (b, i) {
      const tier = {
        A: b.priceA,
        B: Math.round(b.priceA * 0.8),
        C: Math.round(b.priceA * 0.65)
      };
      const priced = i < 11;

      if (priced) {
        pricing[b.id] = { A: tier.A, B: tier.B, C: tier.C, updatedAt: iso(now - (i + 1) * DAY) };

        const listedCount = 2 + (i % 3);
        for (let k = 0; k < listedCount; k++) {
          copies.push(mkCopy(
            b.id,
            CONDS[k % 3],
            'listed',
            SELLERS[(i + k) % SELLERS.length],
            CAMPUSES[(i + k) % 3],
            1 + k * 2 + (i % 2)
          ));
        }

        const soldCount = 1 + (i % 2);
        for (let k = 0; k < soldCount; k++) {
          const cond = CONDS[(k + 1) % 3];
          copies.push(mkCopy(
            b.id,
            cond,
            'sold',
            SELLERS[(i + k + 2) % SELLERS.length],
            CAMPUSES[(i + 1) % 3],
            9 + k * 4 + i,
            tier[cond]
          ));
        }
      } else {
        for (let k = 0; k < 2 + (i % 2); k++) {
          copies.push(mkCopy(
            b.id,
            CONDS[k % 3],
            'stocked',
            SELLERS[(i + k) % SELLERS.length],
            CAMPUSES[(i + k) % 3],
            1 + k
          ));
        }
      }
    });

    // 待上门收书的申请
    [
      [0, 'B', '林同学', '东校区', 2],
      [1, 'A', '许同学', '西校区', 1],
      [4, 'C', '赵同学', '南校区', 1],
      [7, 'B', '周同学', '东校区', 2],
      [10, 'A', '何同学', '西校区', 3]
    ].forEach(function (row) {
      copies.push(mkCopy(books[row[0]].id, row[1], 'pending', row[2], row[3], row[4]));
    });

    // 质检未通过
    copies.push(mkCopy(books[3].id, 'C', 'rejected', '吴同学', '东校区', 5));

    // 当前用户（陈同学）的寄售记录
    [
      [0, 'B', 'listed', 3],
      [3, 'A', 'listed', 5],
      [6, 'B', 'stocked', 2],
      [9, 'A', 'sold', 9],
      [1, 'B', 'sold', 15],
      [12, 'C', 'pending', 1]
    ].forEach(function (row) {
      const b = books[row[0]];
      const price = pricing[b.id] ? pricing[b.id][row[1]] : null;
      copies.push(mkCopy(b.id, row[1], row[2], ME.name, ME.campus, row[3], row[2] === 'sold' ? price : null));
    });

    // 用已售复本组装历史订单
    const soldCopies = copies.filter(function (c) { return c.status === 'sold'; });
    for (let i = 0; i < soldCopies.length; i += 3) {
      const chunk = soldCopies.slice(i, i + 3);
      const items = chunk.map(function (c) {
        return { copyIds: [c.id], bookId: c.bookId, condition: c.condition, qty: 1, price: c.soldPrice || 0 };
      });
      const goodsTotal = items.reduce(function (s, x) { return s + x.price; }, 0);
      orders.push({
        id: 'seedOrder' + (orders.length + 1),
        no: 'BL' + (2026110100 + orders.length),
        items: items,
        goodsTotal: goodsTotal,
        fee: 0,
        total: goodsTotal,
        pickup: orders.length % 2 ? 'dorm' : 'library',
        contact: { name: '王同学', phone: '13800138000', note: '' },
        status: 'done',
        createdAt: iso(now - (orders.length * 5 + 2) * DAY)
      });
    }

    // 一笔待取书订单，方便体验订单状态
    const p1 = copies.find(function (c) { return c.status === 'listed' && c.bookId === books[3].id; });
    const p2 = copies.find(function (c) { return c.status === 'listed' && c.bookId === books[4].id; });
    if (p1 && p2) {
      const orderItems = [p1, p2].map(function (c) {
        const price = pricing[c.bookId] ? pricing[c.bookId][c.condition] : 0;
        c.status = 'sold';
        c.soldPrice = price;
        c.soldAt = iso(now - DAY);
        return { copyIds: [c.id], bookId: c.bookId, condition: c.condition, qty: 1, price: price };
      });
      const goodsTotal = orderItems.reduce(function (s, x) { return s + x.price; }, 0);
      orders.unshift({
        id: 'seedOrderPending',
        no: 'BL' + String(Date.now()).slice(-8),
        items: orderItems,
        goodsTotal: goodsTotal,
        fee: 0,
        total: goodsTotal,
        pickup: 'library',
        contact: { name: '陈同学', phone: '13800001111', note: '下午 5 点后取' },
        status: 'pending',
        createdAt: iso(now - DAY)
      });
    }

    return {
      version: 1,
      books: books,
      copies: copies,
      pricing: pricing,
      orders: orders,
      cart: {},
      withdrawn: 0,
      createdAt: iso(now)
    };
  }

  /* ================= 存储 ================= */
  let DB = null;

  function loadDB() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }
  function saveDB() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(DB)); } catch (e) { /* 忽略 */ }
  }

  /* ================= 派生数据 ================= */
  function bookById(id) {
    return DB.books.find(function (b) { return b.id === id; });
  }
  function copiesOf(bookId, status) {
    return DB.copies.filter(function (c) {
      return c.bookId === bookId && (!status || c.status === status);
    });
  }
  function stockOf(bookId, cond) {
    return DB.copies.filter(function (c) {
      return c.bookId === bookId && c.condition === cond && c.status === 'listed';
    }).length;
  }
  function totalStock(bookId) {
    return CONDS.reduce(function (s, c) { return s + stockOf(bookId, c); }, 0);
  }
  function priceOf(bookId, cond) {
    const p = DB.pricing[bookId];
    return p ? p[cond] : null;
  }
  function minPrice(bookId) {
    const p = DB.pricing[bookId];
    if (!p) return null;
    const list = CONDS.filter(function (c) { return stockOf(bookId, c) > 0; }).map(function (c) { return p[c]; });
    return list.length ? Math.min.apply(null, list) : null;
  }
  function sellerCount(bookId) {
    const set = {};
    DB.copies.forEach(function (c) {
      if (c.bookId === bookId && (c.status === 'listed' || c.status === 'sold' || c.status === 'stocked')) set[c.seller] = 1;
    });
    return Object.keys(set).length;
  }
  function condChip(cond) {
    return '<span class="chip chip-cond">' + cond + ' · ' + COND_META[cond].name + '</span>';
  }
  function orderStatusChip(status) {
    if (status === 'pending') return '<span class="status-chip st-pending">待取书</span>';
    if (status === 'done') return '<span class="status-chip st-done">已完成</span>';
    return '<span class="status-chip st-cancelled">已取消</span>';
  }
  function pickupLabel(key) {
    return key === 'dorm' ? '宿舍楼下配送' : '校内自提点 · 图书馆东门';
  }
  function copyStatusChip(status) {
    if (status === 'pending') return '<span class="chip chip-amber">待上门收书</span>';
    if (status === 'stocked') return '<span class="chip chip-amber">已入库 · 待质检</span>';
    if (status === 'listed') return '<span class="chip chip-green">在售中</span>';
    if (status === 'sold') return '<span class="chip chip-grey">已售出</span>';
    return '<span class="chip chip-red">质检未通过</span>';
  }
  function sellerStats() {
    let earned = 0;
    let pending = 0;
    let soldCount = 0;
    let listedCount = 0;
    let waitingCount = 0;

    DB.copies.forEach(function (c) {
      if (c.seller !== ME.name) return;
      if (c.status === 'sold') {
        earned += (c.soldPrice || 0) * SELLER_RATE;
        soldCount += 1;
      } else if (c.status === 'listed') {
        const p = priceOf(c.bookId, c.condition);
        if (p) pending += p * SELLER_RATE;
        listedCount += 1;
      } else if (c.status === 'stocked' || c.status === 'pending') {
        const p = priceOf(c.bookId, c.condition);
        if (p) pending += p * SELLER_RATE;
        waitingCount += 1;
      }
    });

    return {
      earned: round2(earned),
      pending: round2(pending),
      soldCount: soldCount,
      listedCount: listedCount,
      waitingCount: waitingCount,
      withdrawable: round2(earned - (DB.withdrawn || 0))
    };
  }
  function getCart() {
    const items = [];
    Object.keys(DB.cart).forEach(function (key) {
      const parts = key.split(':');
      const bookId = parts[0];
      const cond = parts[1];
      const b = bookById(bookId);
      const price = priceOf(bookId, cond);
      const stock = stockOf(bookId, cond);
      const qty = Math.min(DB.cart[key], stock);
      if (!b || !price || qty <= 0) return;
      items.push({ key: key, book: b, cond: cond, price: price, stock: stock, qty: qty });
    });
    return items;
  }

  /* ================= 通用组件 ================= */
  function coverHTML(b, extraClass) {
    const pal = COVER_PALETTES[b.palette % COVER_PALETTES.length];
    return '<div class="cover ' + (extraClass || '') + '" style="--c1:' + pal[0] + ';--c2:' + pal[1] + '">' +
      '<span class="cover-cat">' + esc(b.category) + '</span>' +
      '<span class="cover-title">' + esc(b.title) + '</span>' +
      '<span class="cover-author">' + esc(b.author) + '</span>' +
      '</div>';
  }
  function emptyBox(title, sub, extra) {
    return '<div class="empty"><h3>' + esc(title) + '</h3><p>' + esc(sub) + '</p>' +
      (extra || '') + '</div>';
  }

  /* ================= 买家端视图 ================= */
  function viewShop() {
    const totalListed = DB.copies.filter(function (c) { return c.status === 'listed'; }).length;
    const totalSold = DB.copies.filter(function (c) { return c.status === 'sold'; }).length;
    let saveSum = 0;
    let saveCount = 0;
    DB.books.forEach(function (b) {
      if (DB.pricing[b.id] && b.listPrice) {
        saveSum += 1 - DB.pricing[b.id].A / b.listPrice;
        saveCount += 1;
      }
    });
    const avgSave = saveCount ? Math.round((saveSum / saveCount) * 100) : 0;

    let list = DB.books.filter(function (b) { return minPrice(b.id) !== null; });
    const kw = ui.search.trim().toLowerCase();
    if (ui.cat !== '全部') list = list.filter(function (b) { return b.category === ui.cat; });
    if (kw) {
      list = list.filter(function (b) {
        return (b.title + ' ' + b.author + ' ' + b.category).toLowerCase().indexOf(kw) >= 0;
      });
    }
    if (ui.sort === 'price') {
      list.sort(function (a, b) { return minPrice(a.id) - minPrice(b.id); });
    } else if (ui.sort === 'stock') {
      list.sort(function (a, b) { return totalStock(b.id) - totalStock(a.id); });
    } else {
      list.sort(function (a, b) {
        const ta = DB.pricing[a.id] ? DB.pricing[a.id].updatedAt : '';
        const tb = DB.pricing[b.id] ? DB.pricing[b.id].updatedAt : '';
        return tb.localeCompare(ta);
      });
    }

    const heroBooks = [DB.books[9], DB.books[3], DB.books[0]];
    const heroCards = heroBooks.map(function (b, i) {
      return coverHTML(b, 'cover--s' + (i + 1));
    }).join('');

    const cards = list.map(bookCard).join('');

    return '' +
      '<section class="hero">' +
        '<div class="hero-copy">' +
          '<span class="eyebrow">校园图书循环计划 · 第 3 季</span>' +
          '<h1>旧书不该吃灰，<br>它们该去<em>下一届</em>的课桌。</h1>' +
          '<p class="hero-sub">同学把闲置教材交给平台，我们统一收书、逐本质检，再按品相统一定价上架。买得便宜，卖得体面，让一本书多走几届。</p>' +
          '<div class="hero-cta">' +
            '<a class="btn btn-primary" href="#/sell">我有旧书要卖</a>' +
            '<a class="btn btn-ghost" href="#/shop">浏览在售书目</a>' +
          '</div>' +
          '<div class="hero-stats">' +
            '<div><strong>' + totalListed + '</strong><span>复本在售</span></div>' +
            '<div><strong>' + totalSold + '</strong><span>已循环复本</span></div>' +
            '<div><strong>' + avgSave + '%</strong><span>平均比原价省</span></div>' +
          '</div>' +
        '</div>' +
        '<div class="hero-art" aria-hidden="true">' + heroCards +
          '<div class="hero-tag"><b>统一定价 · 不议价</b>同书目按 A / B / C 三档品相统一标价，一次上架。</div>' +
        '</div>' +
      '</section>' +

      '<section class="toolbar">' +
        '<div class="search-box">' +
          '<span class="search-icon">⌕</span>' +
          '<input type="search" data-bind="search" value="' + esc(ui.search) + '" placeholder="搜索书名、作者或分类，如「高等数学」">' +
        '</div>' +
        '<div class="toolbar-row">' +
          '<div class="chips">' +
            CATEGORIES.map(function (c) {
              return '<button type="button" class="chip-btn ' + (ui.cat === c ? 'active' : '') + '" data-action="setCat" data-cat="' + esc(c) + '">' + esc(c) + '</button>';
            }).join('') +
          '</div>' +
          '<div class="toolbar-right">' +
            '<select data-bind="sort">' +
              '<option value="new"' + (ui.sort === 'new' ? ' selected' : '') + '>最近上架</option>' +
              '<option value="price"' + (ui.sort === 'price' ? ' selected' : '') + '>价格最低</option>' +
              '<option value="stock"' + (ui.sort === 'stock' ? ' selected' : '') + '>库存最多</option>' +
            '</select>' +
          '</div>' +
        '</div>' +
      '</section>' +

      '<div class="result-head">' +
        '<h2>在售书目</h2>' +
        '<span>共 ' + list.length + ' 种 · ' + list.reduce(function (s, b) { return s + totalStock(b.id); }, 0) + ' 个复本</span>' +
      '</div>' +
      (list.length
        ? '<div class="book-grid">' + cards + '</div>'
        : emptyBox('没有找到匹配的书目', '换个关键词，或清空筛选条件再看看。',
            '<button type="button" class="btn btn-ghost btn-sm" data-action="clearFilters">清空筛选</button>'));
  }

  function bookCard(b) {
    const price = minPrice(b.id);
    const stock = totalStock(b.id);
    const conds = CONDS.filter(function (c) { return stockOf(b.id, c) > 0; });
    return '' +
      '<article class="book-card">' +
        '<div class="book-cover-wrap">' +
          coverHTML(b) +
          '<span class="stock-tag">在售 ' + stock + ' 本</span>' +
        '</div>' +
        '<div class="book-body">' +
          '<div class="book-tags">' +
            '<span class="chip chip-cat">' + esc(b.category) + '</span>' +
            conds.map(function (c) { return '<span class="chip chip-cond">' + c + ' · ' + COND_META[c].name + '</span>'; }).join('') +
          '</div>' +
          '<h3 class="book-title"><a href="#/book/' + b.id + '">' + esc(b.title) + '</a></h3>' +
          '<p class="book-meta">' + esc(b.author) + ' · ' + esc(b.edition) + '</p>' +
          '<div class="book-foot">' +
            '<span class="price">' + yuan(price) + '<small> 起</small></span>' +
            '<span class="book-sellers">来自 ' + sellerCount(b.id) + ' 位同学寄售</span>' +
            '<div class="book-actions">' +
              '<a class="btn btn-ghost btn-sm" href="#/book/' + b.id + '">查看详情</a>' +
              '<button type="button" class="btn btn-primary btn-sm" data-action="quickAdd" data-book="' + b.id + '">加入购物车</button>' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</article>';
  }

  function viewBook(id) {
    const b = bookById(id);
    if (!b) {
      return '<div class="page-head"><h1>书目不存在</h1></div>' +
        emptyBox('找不到这本书', '它可能已经下架，去淘书页看看其他书目。', '<a class="btn btn-primary btn-sm" href="#/shop">返回淘书</a>');
    }

    syncDetail(b);

    const pricing = DB.pricing[b.id];
    const soldCount = copiesOf(b.id, 'sold').length;
    const active = {
      cond: ui.detail.cond,
      price: pricing ? pricing[ui.detail.cond] : null,
      stock: stockOf(b.id, ui.detail.cond)
    };
    const canBuy = !!(active.price && active.stock > 0);
    const condOptions = CONDS.map(function (c) {
      const p = pricing ? pricing[c] : null;
      const stock = stockOf(b.id, c);
      const disabled = !p || stock === 0;
      return '' +
        '<button type="button" class="cond-option ' + (ui.detail.cond === c ? 'active' : '') + '" ' +
          'data-action="pickCond" data-cond="' + c + '"' + (disabled ? ' disabled' : '') + '>' +
          '<span class="cond-badge">' + c + '</span>' +
          '<span class="cond-text"><b>' + COND_META[c].name + '</b><small>' + COND_META[c].desc + '</small></span>' +
          '<span class="cond-price">' + (p ? yuan(p) : '—') + '</span>' +
          '<span class="cond-stock">' + (stock ? '库存 ' + stock + ' 本' : '暂无') + '</span>' +
        '</button>';
    }).join('');

    return '' +
      '<div class="breadcrumb"><a href="#/shop">淘书</a><span>/</span><span>' + esc(b.category) + '</span><span>/</span><span>' + esc(b.title) + '</span></div>' +
      '<section class="detail">' +
        '<div class="detail-cover">' +
          coverHTML(b, 'cover--lg') +
          '<div class="cover-note">平台统一质检 · 品相分级定价</div>' +
        '</div>' +
        '<div class="detail-main">' +
          '<span class="chip chip-cat">' + esc(b.category) + '</span>' +
          '<h1>' + esc(b.title) + '</h1>' +
          '<p class="detail-sub">' + esc(b.author) + ' · ' + esc(b.publisher) + ' · ' + esc(b.edition) + '</p>' +
          '<div class="detail-meta">' +
            '<span>ISBN ' + esc(b.isbn) + '</span>' +
            (b.listPrice ? '<span>原价 <s>' + yuan(b.listPrice) + '</s></span>' : '') +
            '<span>来自 ' + sellerCount(b.id) + ' 位同学寄售</span>' +
            '<span>已循环 ' + soldCount + ' 本</span>' +
          '</div>' +
          '<p class="detail-desc">' + esc(b.desc) + '</p>' +
          (pricing
            ? '<div class="cond-picker">' + condOptions + '</div>' +
              '<div class="buy-bar">' +
                '<div class="buy-price"><span class="price">' + (canBuy ? yuan(active.price) : '—') + '</span>' +
                  '<small>' + COND_META[active.cond].name + (canBuy ? ' · 库存 ' + active.stock + ' 本' : ' · 暂不可购') + '</small></div>' +
                '<div class="qty">' +
                  '<button type="button" data-action="detailQty" data-delta="-1"' + (ui.detail.qty <= 1 ? ' disabled' : '') + '>−</button>' +
                  '<span>' + ui.detail.qty + '</span>' +
                  '<button type="button" data-action="detailQty" data-delta="1"' + (ui.detail.qty >= active.stock ? ' disabled' : '') + '>+</button>' +
                '</div>' +
                '<button type="button" class="btn btn-ghost" data-action="addToCart"' + (canBuy ? '' : ' disabled') + '>加入购物车</button>' +
                '<button type="button" class="btn btn-primary" data-action="buyNow"' + (canBuy ? '' : ' disabled') + '>立即购买</button>' +
              '</div>'
            : '<div class="notice"><span>⏳</span><span>这本书目已经有同学寄售，目前正在进行质检与<strong>统一定价</strong>，通过后即可上架购买。</span></div>' +
              '<div class="buy-bar"><a class="btn btn-ghost" href="#/shop">继续逛逛其他书目</a></div>') +
        '</div>' +
      '</section>' +
      '<section class="panel how">' +
        '<h2>统一标价是怎么来的？</h2>' +
        '<div class="steps">' +
          '<div class="step"><span class="step-num">01 / 收书</span><h3>平台统一收书</h3><p>同学在线提交旧书，我们在各校区上门收取，并逐本登记为独立复本。</p></div>' +
          '<div class="step"><span class="step-num">02 / 质检</span><h3>按品相分级</h3><p>检查笔记、折页与破损情况，把复本分成 A 九成新、B 八成新、C 七成新三档。</p></div>' +
          '<div class="step"><span class="step-num">03 / 定价</span><h3>集体标价上架</h3><p>同一书目的全部复本合并为一个定价批次，按品相档位统一售价，全场不议价。</p></div>' +
        '</div>' +
      '</section>';
  }

  function syncDetail(b) {
    if (ui.detail.bookId !== b.id) {
      ui.detail.bookId = b.id;
      const pricing = DB.pricing[b.id];
      const first = CONDS.find(function (c) { return pricing && pricing[c] && stockOf(b.id, c) > 0; });
      ui.detail.cond = first || 'A';
      ui.detail.qty = 1;
    }
    const pricing = DB.pricing[b.id];
    const stock = stockOf(b.id, ui.detail.cond);
    const valid = pricing && pricing[ui.detail.cond] && stock > 0;
    if (!valid) {
      const alt = CONDS.find(function (c) { return pricing && pricing[c] && stockOf(b.id, c) > 0; });
      if (alt) {
        ui.detail.cond = alt;
        ui.detail.qty = 1;
      }
    }
    const maxStock = stockOf(b.id, ui.detail.cond) || 1;
    if (ui.detail.qty > maxStock) ui.detail.qty = maxStock;
    if (ui.detail.qty < 1) ui.detail.qty = 1;
  }

  function viewCart() {
    const items = getCart();
    const qtyTotal = items.reduce(function (s, it) { return s + it.qty; }, 0);
    const goodsTotal = items.reduce(function (s, it) { return s + it.price * it.qty; }, 0);

    if (!items.length) {
      return '<div class="page-head"><div><a class="back" href="#/shop">← 继续淘书</a><h1>购物车</h1><p>还没有挑中书</p></div></div>' +
        emptyBox('购物车是空的', '去看看同学们寄售的教材，平台已经统一质检并标好价。', '<a class="btn btn-primary btn-sm" href="#/shop">去淘书</a>');
    }

    const rows = items.map(function (it) {
      return '' +
        '<div class="cart-row">' +
          coverHTML(it.book, 'cover--sm') +
          '<div class="cart-info">' +
            '<h3><a href="#/book/' + it.book.id + '">' + esc(it.book.title) + '</a></h3>' +
            '<div class="meta">' + condChip(it.cond) + '<span>单价 ' + yuan(it.price) + '</span><span>库存 ' + it.stock + ' 本</span></div>' +
          '</div>' +
          '<div class="cart-right">' +
            '<span class="price">' + yuan(it.price * it.qty) + '</span>' +
            '<div class="qty">' +
              '<button type="button" data-action="cartQty" data-key="' + it.key + '" data-delta="-1">−</button>' +
              '<span>' + it.qty + '</span>' +
              '<button type="button" data-action="cartQty" data-key="' + it.key + '" data-delta="1"' + (it.qty >= it.stock ? ' disabled' : '') + '>+</button>' +
            '</div>' +
            '<button type="button" class="remove-btn" data-action="cartRemove" data-key="' + it.key + '">移除</button>' +
          '</div>' +
        '</div>';
    }).join('');

    return '' +
      '<div class="page-head"><div><a class="back" href="#/shop">← 继续淘书</a><h1>购物车</h1><p>共 ' + qtyTotal + ' 本 · 平台已按品相统一定价</p></div></div>' +
      '<div class="cart-layout">' +
        '<div class="cart-list">' + rows + '</div>' +
        '<aside class="cart-summary">' +
          '<h3>结算信息</h3>' +
          '<div class="summary-row"><span>商品数量</span><span>' + qtyTotal + ' 本</span></div>' +
          '<div class="summary-row"><span>商品合计</span><span>' + yuan(goodsTotal) + '</span></div>' +
          '<div class="summary-row"><span>取书服务费</span><span>结算时选择</span></div>' +
          '<div class="summary-row total"><span>合计</span><b>' + yuan(goodsTotal) + '</b></div>' +
          '<a class="btn btn-primary btn-block" href="#/checkout">去结算</a>' +
          '<p class="summary-note">统一标价，全场不议价。自提点取书免服务费，宿舍楼下配送 +' + yuan(DELIVERY_FEE) + '。</p>' +
        '</aside>' +
      '</div>';
  }

  function viewCheckout() {
    const items = getCart();
    if (!items.length) {
      return '<div class="page-head"><h1>结算</h1></div>' +
        emptyBox('购物车是空的', '先挑几本书再来结算。', '<a class="btn btn-primary btn-sm" href="#/shop">去淘书</a>');
    }
    const goodsTotal = items.reduce(function (s, it) { return s + it.price * it.qty; }, 0);

    const itemRows = items.map(function (it) {
      return '<div class="summary-item">' +
        coverHTML(it.book, 'cover--sm') +
        '<span class="t">' + esc(it.book.title) + '<br><span class="q">' + COND_META[it.cond].name + ' × ' + it.qty + '</span></span>' +
        '<b>' + yuan(it.price * it.qty) + '</b>' +
      '</div>';
    }).join('');

    return '' +
      '<div class="page-head"><div><a class="back" href="#/cart">← 返回购物车</a><h1>确认订单</h1><p>填写取书信息，提交后到点自取或等待配送</p></div></div>' +
      '<form class="checkout-layout" data-action="placeOrder">' +
        '<div class="panel">' +
          '<h2>取书方式</h2>' +
          '<div class="pickup-list">' +
            '<label><input type="radio" name="pickup" value="library" checked><span>校内自提点 · 图书馆东门</span><b>免费</b></label>' +
            '<label><input type="radio" name="pickup" value="dorm"><span>送到宿舍楼下 · 22:00 前送达</span><b>+ ' + yuan(DELIVERY_FEE) + '</b></label>' +
          '</div>' +
          '<h2>取书人信息</h2>' +
          '<div class="form-grid">' +
            '<div class="field"><label>姓名</label><input name="name" required value="' + esc(ME.name) + '" placeholder="取书人姓名"></div>' +
            '<div class="field"><label>手机号</label><input name="phone" required value="13800001111" maxlength="11" placeholder="11 位手机号"></div>' +
            '<div class="field full"><label>备注（可选）</label><textarea name="note" placeholder="例如：周三下午 5 点后取书"></textarea></div>' +
          '</div>' +
        '</div>' +
        '<aside class="panel">' +
          '<h2>订单明细</h2>' +
          '<div class="summary-items">' + itemRows + '</div>' +
          '<div class="summary-row"><span>商品合计</span><span>' + yuan(goodsTotal) + '</span></div>' +
          '<div class="summary-row"><span>取书服务费</span><span id="checkoutFee">免费</span></div>' +
          '<div class="summary-row total"><span>应付</span><b id="checkoutTotal">' + yuan(goodsTotal) + '</b></div>' +
          '<button class="btn btn-primary btn-block" type="submit" style="margin-top:16px">提交订单</button>' +
          '<p class="summary-note">提交即视为认可平台统一标价。订单在取书前可取消，库存会自动释放。</p>' +
        '</aside>' +
      '</form>';
  }

  function updateCheckoutTotals() {
    const feeEl = document.getElementById('checkoutFee');
    const totalEl = document.getElementById('checkoutTotal');
    if (!feeEl || !totalEl) return;
    const items = getCart();
    const goodsTotal = items.reduce(function (s, it) { return s + it.price * it.qty; }, 0);
    const checked = document.querySelector('input[name="pickup"]:checked');
    const fee = checked && checked.value === 'dorm' ? DELIVERY_FEE : 0;
    feeEl.textContent = fee ? yuan(fee) : '免费';
    totalEl.textContent = yuan(goodsTotal + fee);
  }

  function viewOrders() {
    const orders = DB.orders.slice().sort(function (a, b) { return b.createdAt.localeCompare(a.createdAt); });

    if (!orders.length) {
      return '<div class="page-head"><div><a class="back" href="#/shop">← 继续淘书</a><h1>我的订单</h1><p>还没有购买记录</p></div></div>' +
        emptyBox('暂无订单', '挑一本书，体验从下单到取书的完整流程。', '<a class="btn btn-primary btn-sm" href="#/shop">去淘书</a>');
    }

    const cards = orders.map(function (o) {
      const items = o.items.map(function (it) {
        const b = bookById(it.bookId);
        return '<div class="order-item">' +
          (b ? coverHTML(b, 'cover--sm') : '') +
          '<div><h4>' + esc(b ? b.title : '书目已删除') + '</h4>' +
            '<div class="meta">' + COND_META[it.condition].name + ' × ' + it.qty + ' · 统一价 ' + yuan(it.price) + '</div></div>' +
          '<span class="amt">' + yuan(it.price * it.qty) + '</span>' +
        '</div>';
      }).join('');

      const actions = [];
      if (o.status === 'pending') {
        actions.push('<button type="button" class="mini-btn" data-action="cancelOrder" data-order="' + o.id + '">取消订单</button>');
        actions.push('<button type="button" class="mini-btn primary" data-action="completeOrder" data-order="' + o.id + '">确认已取书</button>');
      }

      return '' +
        '<article class="order-card">' +
          '<div class="order-head">' +
            '<span class="order-no">' + esc(o.no) + '</span>' +
            '<span class="order-date">' + fmtShort(o.createdAt) + ' · ' + esc(pickupLabel(o.pickup)) + '</span>' +
            orderStatusChip(o.status) +
          '</div>' +
          '<div class="order-items">' + items + '</div>' +
          '<div class="order-foot">' +
            '<span style="font-size:12px;color:var(--muted)">' + (o.status === 'cancelled' ? '订单已取消，库存已释放' : esc(o.contact.name) + ' · ' + esc(o.contact.phone)) + '</span>' +
            actions.join('') +
            '<span class="total">实付<b>' + yuan(o.total) + '</b></span>' +
          '</div>' +
        '</article>';
    }).join('');

    return '' +
      '<div class="page-head"><div><a class="back" href="#/shop">← 继续淘书</a><h1>我的订单</h1><p>共 ' + orders.length + ' 笔订单</p></div></div>' +
      '<div class="orders-list">' + cards + '</div>';
  }

  /* ================= 卖家端视图 ================= */
  function viewSell() {
    const stats = sellerStats();
    const mine = DB.copies.filter(function (c) { return c.seller === ME.name; })
      .sort(function (a, b) { return b.createdAt.localeCompare(a.createdAt); });

    const records = mine.length ? mine.map(function (c) {
      const b = bookById(c.bookId);
      let moneyText = '待定价';
      let moneyHint = '质检完成后给出统一价';
      if (c.status === 'sold') {
        moneyText = yuan((c.soldPrice || 0) * SELLER_RATE);
        moneyHint = '已到账分成';
      } else {
        const p = priceOf(c.bookId, c.condition);
        if (p) {
          moneyText = yuan(p * SELLER_RATE);
          moneyHint = '售出后可得';
        }
      }
      return '<div class="record">' +
        '<div class="record-main"><strong>' + esc(b ? b.title : '—') + '</strong>' +
          '<span>' + c.condition + ' · ' + COND_META[c.condition].name + ' · ' + esc(c.campus) + ' · ' + fmtDate(c.createdAt) + '</span></div>' +
        copyStatusChip(c.status) +
        '<div class="record-money">' + moneyText + '<em>' + moneyHint + '</em></div>' +
      '</div>';
    }).join('') : emptyBox('还没有寄售记录', '把闲置教材提交上来，平台会安排上门收书。', '');

    const titleOptions = DB.books.map(function (b) {
      return '<option value="' + esc(b.title) + '"></option>';
    }).join('');

    return '' +
      '<div class="page-head"><div><a class="back" href="#/shop">← 返回淘书</a><h1>我要卖书</h1><p>提交旧书 → 平台上门收书 → 质检定价上架 → 售出后分账</p></div></div>' +
      '<div class="sell-layout">' +
        '<div class="sell-form">' +
          '<div class="panel">' +
            '<h2 style="margin-top:0">提交收书申请</h2>' +
            '<form data-action="submitBook">' +
              '<div class="form-grid">' +
                '<div class="field full"><label>书名 *</label>' +
                  '<input name="title" required list="bookTitles" placeholder="例如：高等数学（上册）">' +
                  '<datalist id="bookTitles">' + titleOptions + '</datalist>' +
                  '<span class="hint">若书名与已有书目相同，会自动合并进同一书目，参与集体标价。</span>' +
                '</div>' +
                '<div class="field"><label>作者</label><input name="author" placeholder="选填"></div>' +
                '<div class="field"><label>分类</label><select name="category">' +
                  FORM_CATEGORIES.map(function (c) { return '<option value="' + esc(c) + '">' + esc(c) + '</option>'; }).join('') +
                '</select></div>' +
                '<div class="field"><label>出版社</label><input name="publisher" placeholder="选填"></div>' +
                '<div class="field"><label>版次</label><input name="edition" placeholder="如：第 3 版"></div>' +
                '<div class="field"><label>品相</label><select name="condition">' +
                  CONDS.map(function (c) {
                    return '<option value="' + c + '"' + (c === 'B' ? ' selected' : '') + '>' + c + ' · ' + COND_META[c].name + '</option>';
                  }).join('') +
                '</select></div>' +
                '<div class="field"><label>数量</label><input name="qty" type="number" min="1" max="5" value="1"></div>' +
                '<div class="field"><label>期望收购价（可选）</label><input name="expected" type="number" min="0" placeholder="留空则由平台定价"></div>' +
                '<div class="field"><label>所在校区</label><select name="campus">' +
                  CAMPUSES.map(function (c) { return '<option value="' + esc(c) + '">' + esc(c) + '</option>'; }).join('') +
                '</select></div>' +
                '<div class="field full"><button type="submit" class="btn btn-primary btn-block">提交收书申请</button></div>' +
              '</div>' +
            '</form>' +
          '</div>' +
          '<div class="rule-card"><b>分账规则：</b>书籍售出后，成交价的 ' + Math.round(SELLER_RATE * 100) + '% 归寄售同学，' + Math.round((1 - SELLER_RATE) * 100) + '% 用于平台质检、仓储与配送。质检不通过的书会退回或原路返还。</div>' +
        '</div>' +
        '<aside>' +
          '<div class="wallet">' +
            '<div class="wallet-label">可提现收益</div>' +
            '<div class="wallet-number">' + yuan(stats.withdrawable) + '</div>' +
            '<div class="wallet-sub">累计成交分成 ' + yuan(stats.earned) + ' · 已提现 ' + yuan(DB.withdrawn || 0) + '</div>' +
            '<div class="wallet-grid">' +
              '<div><span>在售复本</span><b>' + stats.listedCount + ' 本</b></div>' +
              '<div><span>待售预估</span><b>' + yuan(stats.pending) + '</b></div>' +
              '<div><span>已售出</span><b>' + stats.soldCount + ' 本</b></div>' +
              '<div><span>等待质检</span><b>' + stats.waitingCount + ' 本</b></div>' +
            '</div>' +
            '<button type="button" class="btn" data-action="withdraw">申请提现</button>' +
            '<p class="wallet-note">提现按成交分成结算，预计 1 个工作日内到账。演示环境仅做状态模拟。</p>' +
          '</div>' +
        '</aside>' +
      '</div>' +
      '<div class="section-title">我的寄售记录 <span class="count">' + mine.length + ' 本</span></div>' +
      '<div class="record-list">' + records + '</div>' +
      '<div style="height:44px"></div>';
  }

  /* ================= 管理后台视图 ================= */
  function adminSubnav(active) {
    const items = [
      ['dashboard', '经营看板', '#/admin'],
      ['intake', '收书入库', '#/admin/intake'],
      ['pricing', '质检定价', '#/admin/pricing'],
      ['stock', '库存与在售', '#/admin/stock'],
      ['orders', '订单管理', '#/admin/orders']
    ];
    return '<nav class="subnav">' + items.map(function (it) {
      return '<a class="' + (active === it[0] ? 'active' : '') + '" href="' + it[2] + '">' + it[1] + '</a>';
    }).join('') + '</nav>';
  }

  function adminDashboard() {
    const listed = DB.copies.filter(function (c) { return c.status === 'listed'; }).length;
    const stocked = DB.copies.filter(function (c) { return c.status === 'stocked'; }).length;
    const pending = DB.copies.filter(function (c) { return c.status === 'pending'; }).length;
    const sold = DB.copies.filter(function (c) { return c.status === 'sold'; }).length;
    const total = DB.copies.length;

    const month = new Date();
    const monthStart = new Date(month.getFullYear(), month.getMonth(), 1).getTime();
    const gmv = DB.orders.filter(function (o) {
      return o.status !== 'cancelled' && new Date(o.createdAt).getTime() >= monthStart;
    }).reduce(function (s, o) { return s + o.total; }, 0);

    const pendingBooks = DB.books.filter(function (b) { return copiesOf(b.id, 'stocked').length > 0; }).length;

    const days = [];
    for (let i = 6; i >= 0; i--) {
      const start = new Date();
      start.setHours(0, 0, 0, 0);
      start.setDate(start.getDate() - i);
      const end = new Date(start.getTime() + DAY);
      const intake = DB.copies.filter(function (c) {
        const t = new Date(c.createdAt).getTime();
        return t >= start.getTime() && t < end.getTime();
      }).length;
      const soldToday = DB.copies.filter(function (c) {
        if (!c.soldAt) return false;
        const t = new Date(c.soldAt).getTime();
        return t >= start.getTime() && t < end.getTime();
      }).length;
      days.push({ label: (start.getMonth() + 1) + '/' + start.getDate(), intake: intake, sold: soldToday });
    }
    const maxVal = Math.max.apply(null, days.map(function (d) { return Math.max(d.intake, d.sold); }).concat([1]));

    const chartCols = days.map(function (d) {
      return '<div class="chart-col">' +
        '<div class="chart-bars">' +
          '<i class="bar bar-intake" style="height:' + Math.max(2, Math.round(d.intake / maxVal * 100)) + '%"></i>' +
          '<i class="bar bar-sold" style="height:' + Math.max(2, Math.round(d.sold / maxVal * 100)) + '%"></i>' +
        '</div>' +
        '<span class="chart-label">' + d.label + '</span>' +
      '</div>';
    }).join('');

    const events = [];
    DB.copies.slice().sort(function (a, b) { return b.createdAt.localeCompare(a.createdAt); }).slice(0, 7).forEach(function (c) {
      const b = bookById(c.bookId);
      events.push({
        t: c.createdAt,
        tag: '收书',
        text: c.seller + ' 提交《' + (b ? b.title : '—') + '》1 本 · ' + c.campus
      });
    });
    DB.orders.slice().sort(function (a, b) { return b.createdAt.localeCompare(a.createdAt); }).slice(0, 4).forEach(function (o) {
      events.push({
        t: o.createdAt,
        tag: '订单',
        text: '订单 ' + o.no + ' ' + (o.status === 'cancelled' ? '已取消' : '成交') + ' ' + yuan(o.total)
      });
    });
    events.sort(function (a, b) { return b.t.localeCompare(a.t); });

    return adminSubnav('dashboard') +
      '<div class="page-head"><div><h1>经营看板</h1><p>' + fmtDate(new Date().toISOString()) + ' · 校园二手书统一收售</p></div></div>' +
      '<div class="kpi-grid">' +
        '<div class="kpi"><span>在售复本</span><strong>' + listed + '<small>本</small></strong><em>覆盖 ' + DB.books.filter(function (b) { return minPrice(b.id) !== null; }).length + ' 种书目</em></div>' +
        '<div class="kpi"><span>待质检</span><strong>' + stocked + '<small>本</small></strong><em>' + pendingBooks + ' 个书目待统一定价</em></div>' +
        '<div class="kpi"><span>待上门收书</span><strong>' + pending + '<small>单</small></strong><em>需安排校区上门</em></div>' +
        '<div class="kpi"><span>本月成交额</span><strong>' + yuan(gmv) + '</strong><em>累计售出 ' + sold + ' / ' + total + ' 本</em></div>' +
      '</div>' +
      '<div class="admin-grid">' +
        '<div class="panel">' +
          '<h2>近 7 天收书与成交 <a href="#/admin/orders">查看订单 →</a></h2>' +
          '<div class="chart">' + chartCols + '</div>' +
          '<div class="chart-legend"><i class="dot dot-intake"></i>收书 <i class="dot dot-sold"></i>成交</div>' +
        '</div>' +
        '<div class="panel">' +
          '<h2>待处理任务</h2>' +
          '<div class="task-list">' +
            '<a class="task" href="#/admin/intake"><span class="num">' + pending + '</span>' +
              '<span class="txt"><b>待上门收书</b><span>联系同学并确认收书入库</span></span><span class="arrow">→</span></a>' +
            '<a class="task" href="#/admin/intake"><span class="num">' + stocked + '</span>' +
              '<span class="txt"><b>已入库待质检</b><span>逐本检查品相并准备定价</span></span><span class="arrow">→</span></a>' +
            '<a class="task" href="#/admin/pricing"><span class="num">' + pendingBooks + '</span>' +
              '<span class="txt"><b>书目待统一定价</b><span>把复本合并为定价批次一次上架</span></span><span class="arrow">→</span></a>' +
          '</div>' +
          '<h2 style="margin-top:24px">最近动态</h2>' +
          '<div class="feed">' + events.slice(0, 7).map(function (e) {
            return '<div class="feed-item"><span class="feed-tag ' + (e.tag === '订单' ? 'order' : '') + '">' + e.tag + '</span>' +
              '<span class="feed-text">' + esc(e.text) + '</span><span class="feed-time">' + fmtShort(e.t) + '</span></div>';
          }).join('') + '</div>' +
        '</div>' +
      '</div>' +
      '<div style="height:40px"></div>';
  }

  function adminIntake() {
    const tab = ui.intakeTab || 'pending';
    let list = DB.copies.slice();
    if (tab === 'pending') list = list.filter(function (c) { return c.status === 'pending'; });
    else if (tab === 'stocked') list = list.filter(function (c) { return c.status === 'stocked'; });
    else if (tab === 'rejected') list = list.filter(function (c) { return c.status === 'rejected'; });
    list.sort(function (a, b) { return b.createdAt.localeCompare(a.createdAt); });

    const rows = list.map(function (c) {
      const b = bookById(c.bookId);
      const actions = [];
      if (c.status === 'pending') {
        actions.push('<button type="button" class="mini-btn primary" data-action="intakeAccept" data-copy="' + c.id + '">确认收书</button>');
        actions.push('<button type="button" class="mini-btn danger" data-action="intakeReject" data-copy="' + c.id + '">拒收</button>');
      } else if (c.status === 'stocked') {
        actions.push('<a class="mini-btn" href="#/admin/pricing">去定价</a>');
        actions.push('<button type="button" class="mini-btn danger" data-action="intakeReject" data-copy="' + c.id + '">质检不通过</button>');
      }

      return '<tr>' +
        '<td><div class="cell-book">' + (b ? coverHTML(b) : '') +
          '<div><b>' + esc(b ? b.title : '—') + '</b><span>' + esc(b ? b.category : '') + '</span></div></div></td>' +
        '<td>' + esc(c.seller) + '<br><span style="font-size:11px;color:var(--muted)">' + esc(c.campus) + '</span></td>' +
        '<td>' + CONS_CHIP(c.condition) + '</td>' +
        '<td>' + fmtShort(c.createdAt) + '</td>' +
        '<td>' + copyStatusChip(c.status) + '</td>' +
        '<td><div class="actions">' + (actions.join('') || '—') + '</div></td>' +
      '</tr>';
    }).join('');

    const tabs = [
      ['pending', '待上门收书', DB.copies.filter(function (c) { return c.status === 'pending'; }).length],
      ['stocked', '已入库待质检', DB.copies.filter(function (c) { return c.status === 'stocked'; }).length],
      ['rejected', '质检未通过', DB.copies.filter(function (c) { return c.status === 'rejected'; }).length]
    ];

    return adminSubnav('intake') +
      '<div class="page-head"><div><h1>收书入库</h1><p>确认上门收取的每一本复本，入库后进入质检环节</p></div></div>' +
      '<div class="tabs">' + tabs.map(function (t) {
        return '<button type="button" class="tab ' + (tab === t[0] ? 'active' : '') + '" data-action="setIntakeTab" data-tab="' + t[0] + '">' + t[1] + ' · ' + t[2] + '</button>';
      }).join('') + '</div>' +
      (list.length
        ? '<div class="table-wrap"><table class="table"><thead><tr><th>书目</th><th>寄售人</th><th>品相</th><th>提交时间</th><th>状态</th><th>操作</th></tr></thead><tbody>' + rows + '</tbody></table></div>'
        : emptyBox('当前没有记录', '切换上方状态看看，或等待同学提交收书申请。', ''));
  }

  function CONS_CHIP(cond) {
    return '<span class="chip chip-cond">' + cond + ' · ' + COND_META[cond].name + '</span>';
  }

  function adminPricing() {
    const pendingGroups = DB.books.map(function (b) {
      return { b: b, stocked: copiesOf(b.id, 'stocked') };
    }).filter(function (g) { return g.stocked.length > 0; });

    const pricedBooks = DB.books.filter(function (b) { return !!DB.pricing[b.id]; });

    function card(g, isPending) {
      const b = g.b;
      const stocked = g.stocked;
      const counts = { A: 0, B: 0, C: 0 };
      stocked.forEach(function (c) { counts[c.condition] += 1; });
      const listedCount = copiesOf(b.id, 'listed').length;
      const soldCount = copiesOf(b.id, 'sold').length;
      const cur = DB.pricing[b.id];
      const base = (cur && cur.A) || Math.round((b.listPrice || 60) * 0.5);
      const pA = (cur && cur.A) || base;
      const pB = (cur && cur.B) || Math.round(base * 0.8);
      const pC = (cur && cur.C) || Math.round(base * 0.65);

      return '<div class="price-card">' +
        '<div class="price-head">' +
          coverHTML(b, 'cover--md') +
          '<div class="info"><h3>' + esc(b.title) + '</h3>' +
            '<div class="meta"><span>' + esc(b.category) + '</span>' +
              '<span>' + (cur ? '已定价 · ' + fmtDate(cur.updatedAt) : '尚未定价') + '</span>' +
              '<span>在售 ' + listedCount + ' · 已售 ' + soldCount + '</span></div>' +
          '</div>' +
        '</div>' +
        '<div class="price-counts">' +
          '<span class="count-pill">A 待上架 <b>' + counts.A + '</b></span>' +
          '<span class="count-pill">B 待上架 <b>' + counts.B + '</b></span>' +
          '<span class="count-pill">C 待上架 <b>' + counts.C + '</b></span>' +
          '<span class="count-pill">批次共 <b>' + stocked.length + '</b> 本</span>' +
        '</div>' +
        '<form class="price-form" data-action="savePricing" data-book="' + b.id + '">' +
          '<label>A 九成新<input name="A" type="number" min="1" step="1" value="' + pA + '"></label>' +
          '<label>B 八成新<input name="B" type="number" min="1" step="1" value="' + pB + '"></label>' +
          '<label>C 七成新<input name="C" type="number" min="1" step="1" value="' + pC + '"></label>' +
          '<button class="btn btn-primary" type="submit">' + (isPending ? '统一定价并上架' : '更新标价') + '</button>' +
        '</form>' +
        '<p class="hint-line">' + (isPending
          ? '保存后，该书目全部 ' + stocked.length + ' 本待质检复本将按品相档位统一标价并同时上架。'
          : '调整价格只影响新订单，已成交订单价格不变。') + '</p>' +
      '</div>';
    }

    return adminSubnav('pricing') +
      '<div class="page-head"><div><h1>质检与统一定价</h1><p>同一书目的复本合并为一个定价批次，按品相分档一次上架</p></div></div>' +
      '<div class="panel" style="margin-bottom:20px">' +
        '<h2 style="margin-top:0;font-size:15px">集体标价规则</h2>' +
        '<div class="steps" style="gap:18px">' +
          '<div class="step"><h3>A / B / C 分档</h3><p>按质检结论把复本归入三个品相档，每档对应一个统一售价。</p></div>' +
          '<div class="step"><h3>一次上架</h3><p>同一书目的全部待上架复本同批生效，买家看到的价格始终一致。</p></div>' +
          '<div class="step"><h3>不议价</h3><p>明码标价，卖家按成交价 ' + Math.round(SELLER_RATE * 100) + '% 分账，规则透明。</p></div>' +
        '</div>' +
      '</div>' +
      '<div class="section-title">待定价批次 <span class="count">' + pendingGroups.length + '</span></div>' +
      (pendingGroups.length
        ? '<div class="price-grid">' + pendingGroups.map(function (g) { return card(g, true); }).join('') + '</div>'
        : emptyBox('没有待定价的书目', '所有入库复本都已完成定价。', '')) +
      '<div class="section-title">已定价书目 <span class="count">' + pricedBooks.length + '</span></div>' +
      (pricedBooks.length
        ? '<div class="price-grid">' + pricedBooks.map(function (b) {
            return card({ b: b, stocked: copiesOf(b.id, 'stocked') }, false);
          }).join('') + '</div>'
        : emptyBox('还没有已定价书目', '先完成一个定价批次试试。', ''));
  }

  function adminStock() {
    const books = DB.books.filter(function (b) {
      return !!DB.pricing[b.id] || totalStock(b.id) > 0;
    });
    books.sort(function (a, b) { return totalStock(b.id) - totalStock(a.id); });

    const rows = books.map(function (b) {
      const listed = copiesOf(b.id, 'listed').length;
      const sold = copiesOf(b.id, 'sold').length;
      const stocked = copiesOf(b.id, 'stocked').length;
      const p = DB.pricing[b.id];
      const actions = [
        '<a class="mini-btn" href="#/book/' + b.id + '">查看</a>'
      ];
      if (listed > 0) actions.push('<button type="button" class="mini-btn" data-action="unlistBook" data-book="' + b.id + '">下架在售</button>');
      if (stocked > 0 || !p) actions.push('<a class="mini-btn primary" href="#/admin/pricing">去定价</a>');

      return '<tr>' +
        '<td><div class="cell-book">' + coverHTML(b) +
          '<div><b>' + esc(b.title) + '</b><span>' + esc(b.author) + '</span></div></div></td>' +
        '<td>' + (p
          ? '<span style="font-size:12px;font-weight:600;color:var(--primary)">A ' + yuan(p.A) + ' / B ' + yuan(p.B) + ' / C ' + yuan(p.C) + '</span>'
          : '<span style="color:var(--muted);font-size:12px">待定价</span>') + '</td>' +
        '<td>' + listed + ' 本</td>' +
        '<td>' + sold + ' 本</td>' +
        '<td>' + stocked + ' 本</td>' +
        '<td><div class="actions">' + actions.join('') + '</div></td>' +
      '</tr>';
    }).join('');

    return adminSubnav('stock') +
      '<div class="page-head"><div><h1>库存与在售</h1><p>查看书目维度的在售、已售与待上架复本</p></div></div>' +
      (books.length
        ? '<div class="table-wrap"><table class="table"><thead><tr><th>书目</th><th>统一标价</th><th>在售</th><th>已售</th><th>待上架</th><th>操作</th></tr></thead><tbody>' + rows + '</tbody></table></div>'
        : emptyBox('暂无库存', '去收书入库页处理同学的寄售申请。', ''));
  }

  function adminOrders() {
    const orders = DB.orders.slice().sort(function (a, b) { return b.createdAt.localeCompare(a.createdAt); });

    const rows = orders.map(function (o) {
      const summary = o.items.map(function (it) {
        const b = bookById(it.bookId);
        return (b ? b.title : '—') + ' ×' + it.qty;
      }).join('、');
      const action = o.status === 'pending'
        ? '<button type="button" class="mini-btn primary" data-action="takeOrder" data-order="' + o.id + '">标记已取书</button>'
        : '—';
      return '<tr>' +
        '<td><b style="font-size:12.5px">' + esc(o.no) + '</b><br><span style="font-size:11px;color:var(--muted)">' + fmtShort(o.createdAt) + '</span></td>' +
        '<td><span style="font-size:12px">' + esc(o.contact.name) + '</span><br><span style="font-size:11px;color:var(--muted)">' + esc(o.contact.phone) + '</span></td>' +
        '<td><span style="font-size:12px">' + esc(summary) + '</span><br><span style="font-size:11px;color:var(--muted)">' + esc(pickupLabel(o.pickup)) + '</span></td>' +
        '<td><b>' + yuan(o.total) + '</b></td>' +
        '<td>' + orderStatusChip(o.status) + '</td>' +
        '<td>' + action + '</td>' +
      '</tr>';
    }).join('');

    return adminSubnav('orders') +
      '<div class="page-head"><div><h1>订单管理</h1><p>统一价订单的取书状态与成交金额</p></div></div>' +
      (orders.length
        ? '<div class="table-wrap"><table class="table"><thead><tr><th>订单</th><th>取书人</th><th>书目</th><th>金额</th><th>状态</th><th>操作</th></tr></thead><tbody>' + rows + '</tbody></table></div>'
        : emptyBox('还没有订单', '买家下单后会在这里出现。', ''));
  }

  /* ================= 路由与渲染 ================= */
  const ui = {
    search: '',
    cat: '全部',
    sort: 'new',
    intakeTab: 'pending',
    detail: { bookId: null, cond: 'A', qty: 1 }
  };

  function currentRoute() {
    const raw = (location.hash || '#/shop').replace(/^#\/?/, '');
    const parts = raw.split('?')[0].split('/').filter(Boolean);
    return { parts: parts, route: parts[0] || 'shop' };
  }

  function groupOf(route) {
    if (route === 'sell') return 'seller';
    if (route === 'admin') return 'admin';
    return 'buyer';
  }

  function renderHeader(route) {
    const nav = [
      ['buyer', '淘书', '#/shop'],
      ['seller', '卖书', '#/sell'],
      ['admin', '管理后台', '#/admin']
    ];
    const roleNav = document.getElementById('roleNav');
    roleNav.innerHTML = nav.map(function (n) {
      return '<a class="role-btn ' + (groupOf(route) === n[0] ? 'active' : '') + '" href="' + n[2] + '">' + n[1] + '</a>';
    }).join('');

    const count = Object.keys(DB.cart).reduce(function (s, k) { return s + DB.cart[k]; }, 0);
    document.getElementById('topActions').innerHTML =
      '<span class="persona"><span class="dot"></span>' + esc(ME.name) + ' · ' + esc(ME.campus) + '</span>' +
      '<a class="cart-btn" href="#/cart">购物车' + (count ? '<b class="cart-badge">' + count + '</b>' : '') + '</a>';
  }

  const TITLES = {
    shop: '淘书 · 书循环',
    book: '书目详情 · 书循环',
    cart: '购物车 · 书循环',
    checkout: '确认订单 · 书循环',
    orders: '我的订单 · 书循环',
    sell: '我要卖书 · 书循环',
    admin: '管理后台 · 书循环'
  };

  function render() {
    const route = currentRoute();
    const parts = route.parts;
    renderHeader(parts[0] || 'shop');

    let html = '';
    const r = parts[0] || 'shop';

    if (r === 'shop') {
      html = viewShop();
    } else if (r === 'book') {
      html = viewBook(parts[1]);
    } else if (r === 'cart') {
      html = viewCart();
    } else if (r === 'checkout') {
      html = viewCheckout();
    } else if (r === 'orders') {
      html = viewOrders();
    } else if (r === 'sell') {
      html = viewSell();
    } else if (r === 'admin') {
      const sub = parts[1] || 'dashboard';
      if (sub === 'intake') html = adminIntake();
      else if (sub === 'pricing') html = adminPricing();
      else if (sub === 'stock') html = adminStock();
      else if (sub === 'orders') html = adminOrders();
      else html = adminDashboard();
    } else {
      html = viewShop();
    }

    document.getElementById('app').innerHTML = html;
    document.title = TITLES[r] || '书循环 BookLoop';

    const pickup = document.querySelector('input[name="pickup"]:checked');
    if (pickup) updateCheckoutTotals();
  }

  /* ================= 交互动作 ================= */
  function addCart(bookId, cond, qty, silent) {
    const b = bookById(bookId);
    if (!b) return false;
    const price = priceOf(bookId, cond);
    if (!price) {
      toast('该书目尚未完成统一定价');
      return false;
    }
    const stock = stockOf(bookId, cond);
    const key = bookId + ':' + cond;
    const cur = DB.cart[key] || 0;
    if (cur + qty > stock) {
      toast(stock === 0 ? '该品相已售罄' : '该品相库存仅剩 ' + stock + ' 本');
      return false;
    }
    DB.cart[key] = cur + qty;
    saveDB();
    render();
    if (!silent) toast('已加入购物车：' + b.title + '（' + COND_META[cond].name + '）');
    return true;
  }

  const actions = {
    reset: function () {
      if (!window.confirm('重置演示数据？收书记录、订单和购物车都会回到初始状态。')) return;
      DB = seed();
      saveDB();
      ui.search = '';
      ui.cat = '全部';
      ui.sort = 'new';
      ui.detail = { bookId: null, cond: 'A', qty: 1 };
      render();
      toast('已恢复演示数据');
    },
    setCat: function (el) {
      ui.cat = el.dataset.cat;
      render();
    },
    clearFilters: function () {
      ui.search = '';
      ui.cat = '全部';
      ui.sort = 'new';
      render();
    },
    quickAdd: function (el) {
      const bookId = el.dataset.book;
      const cond = CONDS.find(function (c) { return priceOf(bookId, c) && stockOf(bookId, c) > 0; });
      if (cond) addCart(bookId, cond, 1);
    },
    pickCond: function (el) {
      ui.detail.cond = el.dataset.cond;
      ui.detail.qty = 1;
      render();
    },
    detailQty: function (el) {
      const d = ui.detail;
      const b = bookById(d.bookId);
      const stock = b ? stockOf(b.id, d.cond) : 1;
      const next = d.qty + Number(el.dataset.delta);
      d.qty = Math.min(Math.max(1, stock), Math.max(1, next));
      render();
    },
    addToCart: function () {
      const d = ui.detail;
      addCart(d.bookId, d.cond, d.qty);
    },
    buyNow: function () {
      const d = ui.detail;
      if (addCart(d.bookId, d.cond, d.qty, true)) {
        location.hash = '#/checkout';
      }
    },
    cartQty: function (el) {
      const key = el.dataset.key;
      const delta = Number(el.dataset.delta);
      const parts = key.split(':');
      const stock = stockOf(parts[0], parts[1]);
      const cur = DB.cart[key] || 0;
      const next = Math.min(stock, cur + delta);
      if (next <= 0) delete DB.cart[key];
      else DB.cart[key] = next;
      saveDB();
      render();
    },
    cartRemove: function (el) {
      delete DB.cart[el.dataset.key];
      saveDB();
      render();
      toast('已从购物车移除');
    },
    placeOrder: function (form) {
      const fd = new FormData(form);
      const pickup = String(fd.get('pickup') || 'library');
      const name = String(fd.get('name') || '').trim();
      const phone = String(fd.get('phone') || '').trim();
      const note = String(fd.get('note') || '').trim();

      if (!name) { toast('请填写取书人姓名'); return; }
      if (!/^1\d{10}$/.test(phone)) { toast('请填写正确的 11 位手机号'); return; }

      const items = getCart();
      if (!items.length) { toast('购物车是空的'); return; }

      for (let i = 0; i < items.length; i++) {
        if (stockOf(items[i].book.id, items[i].cond) < items[i].qty) {
          toast('《' + items[i].book.title + '》库存不足，请调整数量');
          return;
        }
      }

      const nowIso = new Date().toISOString();
      const orderItems = [];
      items.forEach(function (it) {
        const picked = DB.copies.filter(function (c) {
          return c.bookId === it.book.id && c.condition === it.cond && c.status === 'listed';
        }).slice(0, it.qty);
        picked.forEach(function (c) {
          c.status = 'sold';
          c.soldPrice = it.price;
          c.soldAt = nowIso;
        });
        orderItems.push({
          copyIds: picked.map(function (c) { return c.id; }),
          bookId: it.book.id,
          condition: it.cond,
          qty: it.qty,
          price: it.price
        });
      });

      const goodsTotal = orderItems.reduce(function (s, x) { return s + x.price * x.qty; }, 0);
      const fee = pickup === 'dorm' ? DELIVERY_FEE : 0;
      DB.orders.unshift({
        id: uid('order'),
        no: 'BL' + String(Date.now()).slice(-8),
        items: orderItems,
        goodsTotal: goodsTotal,
        fee: fee,
        total: goodsTotal + fee,
        pickup: pickup,
        contact: { name: name, phone: phone, note: note },
        status: 'pending',
        createdAt: nowIso
      });
      DB.cart = {};
      saveDB();
      location.hash = '#/orders';
      toast('订单已提交，请按取书方式到点取书');
    },
    cancelOrder: function (el) {
      const o = DB.orders.find(function (x) { return x.id === el.dataset.order; });
      if (!o || o.status !== 'pending') return;
      o.items.forEach(function (it) {
        (it.copyIds || []).forEach(function (cid) {
          const c = DB.copies.find(function (x) { return x.id === cid; });
          if (c && c.status === 'sold') {
            c.status = 'listed';
            c.soldPrice = null;
            c.soldAt = null;
          }
        });
      });
      o.status = 'cancelled';
      saveDB();
      render();
      toast('订单已取消，库存已释放');
    },
    completeOrder: function (el) {
      const o = DB.orders.find(function (x) { return x.id === el.dataset.order; });
      if (!o) return;
      o.status = 'done';
      saveDB();
      render();
      toast('已确认取书，感谢支持图书循环');
    },
    submitBook: function (form) {
      const fd = new FormData(form);
      const title = String(fd.get('title') || '').trim();
      if (!title) { toast('请填写书名'); return; }

      const category = String(fd.get('category') || '计算机');
      let book = DB.books.find(function (b) {
        return b.title.replace(/\s+/g, '').toLowerCase() === title.replace(/\s+/g, '').toLowerCase();
      });

      if (!book) {
        book = {
          id: uid('b'),
          palette: DB.books.length % COVER_PALETTES.length,
          title: title,
          author: String(fd.get('author') || '').trim() || '作者未填写',
          publisher: String(fd.get('publisher') || '').trim() || '—',
          edition: String(fd.get('edition') || '').trim() || '—',
          isbn: '—',
          category: category,
          listPrice: 0,
          desc: '同学寄售的新书目，正在等待平台质检与统一定价。'
        };
        DB.books.push(book);
      }

      const qty = Math.max(1, Math.min(5, Number(fd.get('qty')) || 1));
      const cond = String(fd.get('condition') || 'B');
      const expected = Number(fd.get('expected'));
      const campus = String(fd.get('campus') || ME.campus);
      const nowIso = new Date().toISOString();

      for (let i = 0; i < qty; i++) {
        DB.copies.push({
          id: uid('c'),
          bookId: book.id,
          condition: cond,
          seller: ME.name,
          campus: campus,
          status: 'pending',
          expectedPrice: expected > 0 ? expected : null,
          soldPrice: null,
          soldAt: null,
          createdAt: nowIso
        });
      }

      saveDB();
      render();
      toast('提交成功：《' + book.title + '》×' + qty + '，我们会联系你安排 ' + campus + ' 上门收书');
    },
    savePricing: function (form) {
      const bookId = form.dataset.book;
      const b = bookById(bookId);
      const vals = {};
      let ok = true;
      CONDS.forEach(function (c) {
        const input = form.querySelector('input[name="' + c + '"]');
        const v = Math.round(Number(input ? input.value : 0));
        if (!v || v <= 0) ok = false;
        vals[c] = v;
      });
      if (!ok) { toast('请为 A / B / C 三档填写有效价格'); return; }

      DB.pricing[bookId] = { A: vals.A, B: vals.B, C: vals.C, updatedAt: new Date().toISOString() };
      let listedCount = 0;
      DB.copies.forEach(function (c) {
        if (c.bookId === bookId && c.status === 'stocked') {
          c.status = 'listed';
          listedCount += 1;
        }
      });
      saveDB();
      render();
      toast('《' + (b ? b.title : '书目') + '》已完成统一定价' + (listedCount ? '，' + listedCount + ' 本复本同批上架' : ''));
    },
    intakeAccept: function (el) {
      const c = DB.copies.find(function (x) { return x.id === el.dataset.copy; });
      if (!c) return;
      c.status = 'stocked';
      saveDB();
      render();
      toast('已确认收书入库，进入待质检队列');
    },
    intakeReject: function (el) {
      const c = DB.copies.find(function (x) { return x.id === el.dataset.copy; });
      if (!c) return;
      if (!window.confirm('确认将该复本标记为质检不通过？')) return;
      c.status = 'rejected';
      saveDB();
      render();
      toast('已标记为质检不通过');
    },
    unlistBook: function (el) {
      const bookId = el.dataset.book;
      let count = 0;
      DB.copies.forEach(function (c) {
        if (c.bookId === bookId && c.status === 'listed') {
          c.status = 'stocked';
          count += 1;
        }
      });
      saveDB();
      render();
      toast('已下架 ' + count + ' 本在售复本，回到待定价库存');
    },
    takeOrder: function (el) {
      const o = DB.orders.find(function (x) { return x.id === el.dataset.order; });
      if (!o) return;
      o.status = 'done';
      saveDB();
      render();
      toast('订单已标记为已取书');
    },
    withdraw: function () {
      const stats = sellerStats();
      if (stats.withdrawable <= 0) { toast('暂无可提现金额'); return; }
      DB.withdrawn = round2((DB.withdrawn || 0) + stats.withdrawable);
      saveDB();
      render();
      toast('已申请提现 ' + yuan(stats.withdrawable) + '，预计 1 个工作日内到账');
    },
    setIntakeTab: function (el) {
      ui.intakeTab = el.dataset.tab;
      render();
    }
  };

  /* ================= 事件委托 ================= */
  document.addEventListener('click', function (e) {
    const el = e.target.closest('[data-action]');
    if (!el) return;
    if (el.tagName === 'FORM') return;
    const fn = actions[el.dataset.action];
    if (fn) {
      e.preventDefault();
      fn(el);
    }
  });

  document.addEventListener('input', function (e) {
    const el = e.target.closest('[data-bind]');
    if (!el) return;
    const key = el.dataset.bind;
    if (el.type === 'checkbox') ui[key] = el.checked;
    else ui[key] = el.value;

    if (key === 'search') {
      render();
      const again = document.querySelector('[data-bind="search"]');
      if (again) {
        again.focus();
        again.value = ui.search;
        const len = again.value.length;
        again.setSelectionRange(len, len);
      }
    }
  });

  document.addEventListener('change', function (e) {
    const el = e.target.closest('[data-bind]');
    if (el && el.tagName === 'SELECT') {
      ui[el.dataset.bind] = el.value;
      render();
      return;
    }
    if (e.target.name === 'pickup') updateCheckoutTotals();
  });

  document.addEventListener('submit', function (e) {
    const form = e.target.closest('form[data-action]');
    if (!form) return;
    e.preventDefault();
    const fn = actions[form.dataset.action];
    if (fn) fn(form);
  });

  window.addEventListener('hashchange', function () {
    ui.detail.bookId = null;
    render();
    window.scrollTo({ top: 0, behavior: 'instant' in window ? 'instant' : 'auto' });
  });

  /* ================= 启动 ================= */
  DB = loadDB();
  if (!DB || !DB.books || !DB.copies || !DB.pricing) {
    DB = seed();
    saveDB();
  }
  if (!DB.cart) DB.cart = {};
  if (!DB.withdrawn) DB.withdrawn = 0;

  render();
})();
