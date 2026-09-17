var TRACKER_CATS = ["Groceries","Eating out","Household supplies","Other"];
var TABS = ["plan","recipes","groceries","budget","overview"];

function defaultState(){
  var todayISO = new Date().toISOString().slice(0,10);
  var weeks = [];
  for (var w=0; w<N_WEEKS; w++){
    weeks.push({
      gbudgeted: "", gspent: "",
      tracker: TRACKER_CATS.map(function(c){ return {cat:c, planned:"", actual:""}; })
    });
  }
  return {
    startDate: todayISO,
    currentWeek: 0,
    cooked: {},      // "dayIdx-slot" -> true
    grocery: {},      // "week-cat-item" -> true
    weeks: weeks,
    onboarded: false,   // has this customer been through the taste-preference intro?
    prefsLiked: {},     // ingredient name -> true
    prefsDisliked: {},  // ingredient name -> true
    activeTab: "plan"   // which of TABS is currently showing
  };
}
function loadState(){
  try{
    var el = document.getElementById('app-state');
    if (el && el.textContent){
      var parsed = JSON.parse(el.textContent);
      if (parsed && typeof parsed === 'object' && parsed.weeks && parsed.weeks.length === N_WEEKS){
        // Backfill fields added after this save was made, so older saved
        // states (from before taste preferences existed) still load cleanly.
        if (typeof parsed.onboarded !== 'boolean') parsed.onboarded = false;
        if (!parsed.prefsLiked || typeof parsed.prefsLiked !== 'object') parsed.prefsLiked = {};
        if (!parsed.prefsDisliked || typeof parsed.prefsDisliked !== 'object') parsed.prefsDisliked = {};
        if (typeof parsed.activeTab !== 'string' || TABS.indexOf(parsed.activeTab) === -1) parsed.activeTab = "plan";
        return parsed;
      }
    }
  } catch(e){}
  return defaultState();
}
var state = loadState();

function money(v){ var n = parseFloat(v); return isNaN(n) ? null : n; }
function fmt(n){ return (n<0?"-$":"$") + Math.abs(n).toFixed(2); }

function addDays(iso, n){
  var d = new Date(iso + "T00:00:00");
  d.setDate(d.getDate() + n);
  return d;
}
function fmtDate(d){
  return d.toLocaleDateString(undefined, {month:"short", day:"numeric"});
}
function fmtDateShort(d){
  return d.toLocaleDateString(undefined, {month:"short", day:"numeric"});
}
var DAY_NAMES = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];

function recipeFor(slot, poolIdx){
  if (slot === "b") return RECIPES_B[poolIdx];
  if (slot === "l") return RECIPES_L[poolIdx];
  return RECIPES_D[poolIdx];
}
function poolFor(slot){
  if (slot === "b") return RECIPES_B;
  if (slot === "l") return RECIPES_L;
  return RECIPES_D;
}
function recipeCost(r){
  return r.ing.reduce(function(sum, name){ return sum + (COST_PER_USE[name] || 0); }, 0);
}

// ---------- taste-preference personalization ----------
// The 91-day ROTATION is the carefully balanced default (no immediate
// repeats, steady weekly nutrition). Personalization never rewrites that
// rotation — it only substitutes, meal by meal, whenever the assigned
// recipe touches a disliked ingredient, swapping in another recipe from the
// same pool (breakfast/lunch/dinner) that avoids it. If someone dislikes an
// ingredient so common that no recipe in a pool is safe, the original stays
// (better than nothing) rather than silently disappearing from the plan.
function hasDisliked(r){
  var disliked = state.prefsDisliked;
  for (var i=0;i<r.ing.length;i++){ if (disliked[r.ing[i]]) return true; }
  return false;
}
function likedOverlap(r){
  var liked = state.prefsLiked;
  var n = 0;
  for (var i=0;i<r.ing.length;i++){ if (liked[r.ing[i]]) n++; }
  return n;
}
function hasActivePrefs(){
  return Object.keys(state.prefsDisliked).length>0 || Object.keys(state.prefsLiked).length>0;
}
function safeIndicesSorted(slot){
  var pool = poolFor(slot);
  var safe = [];
  pool.forEach(function(r,i){ if (!hasDisliked(r)) safe.push(i); });
  // Prefer recipes that use more liked ingredients; stable-sort keeps the
  // pool's original order among ties, so variety is preserved.
  safe.sort(function(a,b){ return likedOverlap(pool[b]) - likedOverlap(pool[a]); });
  return safe;
}
function effectiveIdx(slot, dayIdx){
  var origIdx = ROTATION[dayIdx][slot];
  if (!hasActivePrefs()) return origIdx;
  var pool = poolFor(slot);
  if (!hasDisliked(pool[origIdx])) return origIdx;
  var safe = safeIndicesSorted(slot);
  if (!safe.length) return origIdx; // nothing avoids it — keep the plan intact
  var slotOffset = slot==="b" ? 0 : (slot==="l" ? 1 : 2);
  return safe[(dayIdx + slotOffset) % safe.length];
}
function activeRecipeFor(slot, dayIdx){
  return recipeFor(slot, effectiveIdx(slot, dayIdx));
}

// ---------- render ----------
function renderWeekNav(){
  var w = state.currentWeek;
  document.getElementById('wkTitle').textContent = 'Week ' + (w+1) + ' of ' + N_WEEKS;
  var first = addDays(state.startDate, w*7);
  var last = addDays(state.startDate, w*7+6);
  document.getElementById('wkDates').textContent = fmtDateShort(first) + ' – ' + fmtDateShort(last);
  document.getElementById('prevWeek').disabled = (w === 0);
  document.getElementById('nextWeek').disabled = (w === N_WEEKS-1);
  document.getElementById('startDateInput').value = state.startDate;

  var jump = document.getElementById('weekJump');
  var opts = "";
  for (var i=0;i<N_WEEKS;i++){
    opts += '<option value="'+i+'"'+(i===w?" selected":"")+'>Week '+(i+1)+'</option>';
  }
  jump.innerHTML = opts;
}

function goToWeek(idx, opts){
  var weekChanged = false;
  if (idx>=0 && idx<N_WEEKS && idx!==state.currentWeek){
    state.currentWeek = idx;
    weekChanged = true;
  }
  var tabChanged = false;
  if (opts && opts.switchTab && state.activeTab !== "plan"){
    state.activeTab = "plan";
    tabChanged = true;
  }
  if (weekChanged || tabChanged){
    renderAll();
    updateTabUI(true);
    scheduleSave();
  }
}

// ---------- tabbed pages (Overview / This Week / Recipes / Groceries / Budget) ----------
// All five panels are always rendered in the DOM (renderAll() fills every
// one, every time) — tabs only change which panel is scrolled into view via
// a horizontal transform, so no data ever needs a second render pass when
// the user switches tabs.
function tabIndex(name){
  var i = TABS.indexOf(name);
  return i<0 ? TABS.indexOf("plan") : i;
}
function updateTabUI(animate){
  var idx = tabIndex(state.activeTab);
  document.querySelectorAll('.tabbtn').forEach(function(btn){
    btn.classList.toggle('active', btn.getAttribute('data-tab') === state.activeTab);
  });
  document.querySelectorAll('.tabpage').forEach(function(pg){
    pg.setAttribute('aria-hidden', pg.getAttribute('data-tab') === state.activeTab ? 'false' : 'true');
  });
  var viewport = document.getElementById('tabPagesViewport');
  var track = document.getElementById('tabPagesTrack');
  if (!viewport || !track) return;
  var w = viewport.clientWidth;
  if (animate === false){
    track.style.transition = 'none';
    track.style.transform = 'translateX(' + (-idx*w) + 'px)';
    track.offsetHeight; // force reflow so the next change re-enables the transition
    track.style.transition = '';
  } else {
    track.style.transition = '';
    track.style.transform = 'translateX(' + (-idx*w) + 'px)';
  }
}
function setActiveTab(nameOrIdx, animate){
  var idx = typeof nameOrIdx === 'number' ? nameOrIdx : tabIndex(nameOrIdx);
  idx = Math.max(0, Math.min(TABS.length-1, idx));
  var name = TABS[idx];
  if (name === state.activeTab){ updateTabUI(animate); return; }
  state.activeTab = name;
  updateTabUI(animate);
  scheduleSave();
}
function initTabSwipe(){
  var viewport = document.getElementById('tabPagesViewport');
  var track = document.getElementById('tabPagesTrack');
  if (!viewport || !track) return;
  var startX=0, startY=0, dragging=false, tracking=false, vw=0;
  viewport.addEventListener('touchstart', function(e){
    if (e.touches.length !== 1) return;
    startX = e.touches[0].clientX; startY = e.touches[0].clientY;
    dragging = false; tracking = true;
    vw = viewport.clientWidth;
  }, {passive:true});
  viewport.addEventListener('touchmove', function(e){
    if (!tracking) return;
    var dx = e.touches[0].clientX - startX;
    var dy = e.touches[0].clientY - startY;
    if (!dragging){
      if (Math.abs(dx) > 8 && Math.abs(dx) > Math.abs(dy)) dragging = true;
      else if (Math.abs(dy) > 8) { tracking = false; return; } // vertical scroll wins
      else return;
    }
    e.preventDefault();
    var idx = tabIndex(state.activeTab);
    var translate = (-idx*vw) + dx;
    var min = -(TABS.length-1)*vw, max = 0;
    if (translate > max) translate = max + (translate-max)*0.35;
    if (translate < min) translate = min + (translate-min)*0.35;
    track.style.transition = 'none';
    track.style.transform = 'translateX(' + translate + 'px)';
  }, {passive:false});
  viewport.addEventListener('touchend', function(e){
    if (!dragging){ tracking = false; return; }
    var dx = e.changedTouches[0].clientX - startX;
    var idx = tabIndex(state.activeTab);
    var threshold = vw * 0.18;
    var newIdx = idx;
    if (dx <= -threshold && idx < TABS.length-1) newIdx = idx+1;
    else if (dx >= threshold && idx>0) newIdx = idx-1;
    track.style.transition = '';
    dragging = false; tracking = false;
    if (newIdx !== idx) setActiveTab(newIdx, true);
    else updateTabUI(true);
  }, {passive:true});
  viewport.addEventListener('touchcancel', function(){
    dragging = false; tracking = false; updateTabUI(true);
  }, {passive:true});
  window.addEventListener('resize', function(){ updateTabUI(false); });
}

function renderPlan(){
  var w = state.currentWeek;
  var html = "";
  var done = 0, total = 0;
  var weekCal=0, weekP=0, weekC=0, weekF=0;
  for (var i=0;i<7;i++){
    var dayIdx = w*7+i;
    var date = addDays(state.startDate, dayIdx);
    var dayCal = 0;
    var slotRecipes = [["b","Breakfast"],["l","Lunch"],["d","Dinner"]].map(function(pair){
      return {slot:pair[0], label:pair[1], r: activeRecipeFor(pair[0], dayIdx)};
    });
    slotRecipes.forEach(function(sr){ dayCal += sr.r.cal; weekCal += sr.r.cal; weekP += sr.r.p; weekC += sr.r.c; weekF += sr.r.f; });
    var weekdayName = date.toLocaleDateString(undefined, {weekday:"long"});
    html += '<div class="day-card"><div class="dname"><span>'+weekdayName+'</span><span class="dcal">'+dayCal.toLocaleString()+' Cal</span><span class="ddate">'+fmtDate(date)+'</span></div>';
    slotRecipes.forEach(function(sr){
      var key = dayIdx+"-"+sr.slot;
      var checked = !!state.cooked[key];
      total++; if(checked) done++;
      html += '<label class="meal-row'+(checked?" done":"")+'">'+
        '<input type="checkbox" data-key="'+key+'" '+(checked?"checked":"")+'>'+
        '<span class="mtype">'+sr.label+'</span><span class="mname">'+sr.r.n+'</span></label>';
    });
    html += '</div>';
  }
  document.getElementById('dayList').innerHTML = html;
  document.getElementById('mealProgressLabel').textContent = done + ' / ' + total + ' meals cooked';
  document.getElementById('mealProgressBar').style.width = Math.round(100*done/total) + '%';

  document.getElementById('nutriCal').textContent = Math.round(weekCal/7).toLocaleString();
  document.getElementById('nutriProtein').textContent = Math.round(weekP/7) + 'g';
  document.getElementById('nutriCarbFat').textContent = Math.round(weekC/7) + 'g · ' + Math.round(weekF/7) + 'g';
}

function weekRecipeRefs(){
  var w = state.currentWeek;
  var seen = {}; var refs = [];
  for (var i=0;i<7;i++){
    var dayIdx = w*7+i;
    ["b","l","d"].forEach(function(slot){
      var idx = effectiveIdx(slot, dayIdx);
      var key = slot+idx;
      if (!seen[key]){ seen[key]=true; refs.push({slot:slot, idx:idx}); }
    });
  }
  return refs;
}

function renderRecipesWeek(){
  var refs = weekRecipeRefs();
  var order = {b:0,l:1,d:2};
  refs.sort(function(a,b){ return order[a.slot]-order[b.slot]; });
  var tagName = {b:"Breakfast", l:"Lunch", d:"Dinner"};
  var html = '<div class="recipe-grid">';
  refs.forEach(function(ref){
    var r = recipeFor(ref.slot, ref.idx);
    var steps = r.steps.map(function(s){ return '<li>'+s+'</li>'; }).join('');
    html += '<div class="recipe"><div class="rhead"><span class="tag">'+tagName[ref.slot]+'</span><span>'+r.n+'</span></div>'+
      '<div class="rbody"><div class="nutri"><span>'+r.cal+' Cal</span><span>'+r.p+'g protein</span><span>'+r.c+'g carbs</span><span>'+r.f+'g fat</span></div>'+
      '<div class="ilbl">Ingredients</div><div class="ing">'+r.ing.join(", ")+'</div>'+
      '<div class="ilbl">Steps</div><ol>'+steps+'</ol></div></div>';
  });
  html += '</div>';
  document.getElementById('recipesWeek').innerHTML = html;
}

function weekIngredientCounts(){
  var w = state.currentWeek;
  var counts = {};
  for (var i=0;i<7;i++){
    var dayIdx = w*7+i;
    ["b","l","d"].forEach(function(slot){
      var r = activeRecipeFor(slot, dayIdx);
      r.ing.forEach(function(name){ counts[name] = (counts[name]||0) + 1; });
    });
  }
  return counts;
}

function weekGroceryByCategory(counts){
  var byCat = {};
  CAT_ORDER.forEach(function(c){ byCat[c] = []; });
  Object.keys(counts).sort().forEach(function(name){
    var cat = MASTER_CAT[name] || "Pantry & Grains";
    byCat[cat].push(name);
  });
  return byCat;
}

// ---------- quantity formatting ----------
var UNIT_PLURAL = { lb:"lb", cup:"cups", tbsp:"tbsp", oz:"oz", can:"cans", clove:"cloves", slice:"slices", package:"packages" };
function formatFraction(n){
  var whole = Math.floor(n + 1e-9);
  var frac = n - whole;
  var fracStr = "";
  if (frac >= 0.875) whole += 1;
  else if (frac >= 0.625) fracStr = "¾";
  else if (frac >= 0.375) fracStr = "½";
  else if (frac >= 0.125) fracStr = "¼";
  if (whole === 0 && fracStr) return fracStr;
  return whole + fracStr;
}
function qtyLabel(name, count){
  var q = QTY_PER_USE[name];
  if (!q || !count) return "";
  var total = q.amt * count;
  if (q.unit === "ct"){
    return "×" + Math.ceil(total - 1e-9);
  }
  if (q.unit === "can" || q.unit === "clove" || q.unit === "slice" || q.unit === "package" || q.unit === "tbsp"){
    var n = Math.ceil(total - 1e-9);
    return n + " " + (n===1 ? q.unit : UNIT_PLURAL[q.unit]);
  }
  // lb, cup, oz — snap to nearest quarter
  var snapped = Math.round(total*4)/4;
  var label = formatFraction(snapped);
  var unitLabel = (snapped===1) ? q.unit : UNIT_PLURAL[q.unit];
  return label + " " + unitLabel;
}

function weekMarketEstimate(w){
  if (w===undefined) w = state.currentWeek;
  var total = 0;
  for (var i=0;i<7;i++){
    var dayIdx = w*7+i;
    ["b","l","d"].forEach(function(slot){
      total += recipeCost(activeRecipeFor(slot, dayIdx));
    });
  }
  return total;
}

function renderGroceries(){
  var w = state.currentWeek;
  var counts = weekIngredientCounts();
  var byCat = weekGroceryByCategory(counts);
  var html = "";
  var checkedCount = 0, total = 0;
  CAT_ORDER.forEach(function(cat){
    var items = byCat[cat];
    if (!items.length) return;
    html += '<div><div class="cat-block"><div class="cat-title">'+cat+'</div><div class="glist">';
    items.forEach(function(item){
      var key = w+"-"+cat+"-"+item;
      var checked = !!state.grocery[key];
      total++; if(checked) checkedCount++;
      html += '<label class="gitem'+(checked?" checked":"")+'">'+
        '<input type="checkbox" data-gkey="'+key+'">'+
        '<span class="iname">'+item+'</span>'+
        '<span class="iqty">'+qtyLabel(item, counts[item])+'</span></label>';
    });
    html += '</div></div></div>';
  });
  document.getElementById('groceryList').innerHTML = html;
  document.querySelectorAll('#groceryList input[type=checkbox]').forEach(function(cb){
    var key = cb.getAttribute('data-gkey');
    cb.checked = !!state.grocery[key];
  });
  document.getElementById('groProgressLabel').textContent = checkedCount + ' / ' + total + ' checked';
  document.getElementById('groProgressBar').style.width = (total? Math.round(100*checkedCount/total):0) + '%';

  document.getElementById('marketEstimateVal').textContent = fmt(weekMarketEstimate());

  var wk = state.weeks[w];
  document.getElementById('gb-budgeted').value = wk.gbudgeted;
  document.getElementById('gb-spent').value = wk.gspent;
  var b = money(wk.gbudgeted), s = money(wk.gspent);
  var diffEl = document.getElementById('gb-diff');
  if (b===null || s===null){ diffEl.textContent = '—'; diffEl.className='val'; }
  else {
    var diff = b - s;
    diffEl.textContent = (diff>=0? 'Under ':'Over ') + fmt(Math.abs(diff));
    diffEl.className = 'val ' + (diff<0?'over':'under');
  }
}

function renderTracker(){
  var w = state.currentWeek;
  var wk = state.weeks[w];
  var html = "";
  var totals = {p:0,a:0};
  wk.tracker.forEach(function(row, idx){
    var p = money(row.planned), a = money(row.actual);
    if (p!==null) totals.p += p;
    if (a!==null) totals.a += a;
    var diffTxt = "—", diffClass = "";
    if (p!==null && a!==null){
      var d = p - a;
      diffTxt = (d>=0?'+':'') + fmt(d);
      diffClass = d<0 ? 'over' : 'under';
    }
    html += '<tr><td>'+row.cat+'</td>'+
      '<td><input type="text" inputmode="decimal" data-tidx="'+idx+'" value="'+row.planned+'" placeholder="$0"></td>'+
      '<td><input type="text" inputmode="decimal" data-tidx="'+idx+'" data-actual="1" value="'+row.actual+'" placeholder="$0"></td>'+
      '<td class="diff '+diffClass+'">'+diffTxt+'</td></tr>';
  });
  var totalDiff = totals.p - totals.a;
  var totalDiffTxt = (totals.p||totals.a) ? ((totalDiff>=0?'+':'')+fmt(totalDiff)) : '—';
  html += '<tr class="total"><td>Week total</td><td>'+(totals.p?fmt(totals.p):'—')+'</td><td>'+(totals.a?fmt(totals.a):'—')+'</td>'+
    '<td class="diff '+(totalDiff<0?'over':'under')+'">'+totalDiffTxt+'</td></tr>';
  document.getElementById('trackerBody').innerHTML = html;
}

function renderSeasonStrip(){
  var cookedDays = 0;
  for (var d=0; d<91; d++){
    if (state.cooked[d+"-b"] && state.cooked[d+"-l"] && state.cooked[d+"-d"]) cookedDays++;
  }
  document.getElementById('seasonDays').textContent = cookedDays + ' / 91';

  var totalSpent = 0, weeksWithData = 0, totalPlanned = 0;
  state.weeks.forEach(function(wk){
    var s = money(wk.gspent);
    if (s!==null){ totalSpent += s; weeksWithData++; }
    var b = money(wk.gbudgeted);
    if (b!==null) totalPlanned += b;
  });
  document.getElementById('seasonSpent').textContent = fmt(totalSpent);
  document.getElementById('seasonAvg').textContent = weeksWithData ? fmt(totalSpent/weeksWithData) : '—';
}

function renderOverview(){
  var html = "";
  for (var w=0; w<N_WEEKS; w++){
    var first = addDays(state.startDate, w*7);
    var last = addDays(state.startDate, w*7+6);
    var openAttr = (w===state.currentWeek) ? " open" : "";
    html += '<details class="ov-week"'+openAttr+'><summary><span>Week '+(w+1)+'</span><span class="ov-cost">~'+fmt(weekMarketEstimate(w))+'</span><span class="ov-dates">'+fmtDateShort(first)+' – '+fmtDateShort(last)+'</span></summary>';
    html += '<div class="ov-days">';
    for (var i=0;i<7;i++){
      var dayIdx = w*7+i;
      var date = addDays(state.startDate, dayIdx);
      var weekdayShort = date.toLocaleDateString(undefined, {weekday:"short"});
      var b = activeRecipeFor("b", dayIdx), l = activeRecipeFor("l", dayIdx), d = activeRecipeFor("d", dayIdx);
      html += '<div class="ov-day"><div class="ov-dname">'+weekdayShort+' '+fmtDateShort(date)+'</div>'+
        '<div class="ov-meals"><b>B</b> '+b.n+' &nbsp; <b>L</b> '+l.n+' &nbsp; <b>D</b> '+d.n+'</div></div>';
    }
    html += '</div><button type="button" class="ov-viewbtn" data-week="'+w+'">Open this week&#39;s plan</button></details>';
  }
  document.getElementById('overviewList').innerHTML = html;
}

// ---------- taste-preference onboarding ----------
var forceShowOnboard = false;
function chipState(name){
  if (state.prefsDisliked[name]) return "dislike";
  if (state.prefsLiked[name]) return "like";
  return "neutral";
}
function cycleChip(name){
  var cur = chipState(name);
  delete state.prefsLiked[name];
  delete state.prefsDisliked[name];
  if (cur === "neutral") state.prefsLiked[name] = true;
  else if (cur === "like") state.prefsDisliked[name] = true;
  // dislike -> neutral: leave both deleted
}
function renderOnboardChips(){
  var html = "";
  CAT_ORDER.forEach(function(cat){
    var items = Object.keys(MASTER_CAT).filter(function(n){ return MASTER_CAT[n]===cat; }).sort();
    html += '<div class="ob-catlabel">'+cat+'</div><div class="ob-chips">';
    items.forEach(function(name){
      html += '<button type="button" class="ob-chip" data-item="'+name+'" data-state="'+chipState(name)+'">'+name+'</button>';
    });
    html += '</div>';
  });
  document.getElementById('onboardChips').innerHTML = html;
  document.querySelectorAll('.ob-chip').forEach(function(chip){
    chip.onclick = function(){
      var name = this.getAttribute('data-item');
      cycleChip(name);
      this.setAttribute('data-state', chipState(name));
      scheduleSave();
    };
  });
}
function finishOnboarding(){
  state.onboarded = true;
  forceShowOnboard = false;
  updateOnboardVisibility();
  renderAll();
  scheduleSave();
}
function updateOnboardVisibility(){
  var show = !state.onboarded || forceShowOnboard;
  document.getElementById('onboardOverlay').classList.toggle('show', show);
  if (show) renderOnboardChips();
}
function renderPrefsNote(){
  var note = document.getElementById('prefsNote');
  var disliked = Object.keys(state.prefsDisliked);
  if (!disliked.length){ note.hidden = true; return; }
  note.hidden = false;
  note.innerHTML = 'Meals are tailored to skip <b>'+disliked.join(', ')+'</b> wherever a swap is available.';
}

function renderAll(){
  renderWeekNav();
  renderPlan();
  renderRecipesWeek();
  renderGroceries();
  renderTracker();
  renderSeasonStrip();
  renderOverview();
  renderPrefsNote();
  attachHandlers();
}

// ---------- persistence ----------
// The full state object is embedded as JSON in a hidden <script> tag before
// each save, and read back from that same tag on the next load (loadState
// above) — this is what makes checkboxes, budgets, and the current week
// actually survive a refresh, instead of just being a snapshot of what the
// page happened to look like when it was last saved.
function persistStateToDom(){
  var el = document.getElementById('app-state');
  if (!el){
    el = document.createElement('script');
    el.type = 'application/json';
    el.id = 'app-state';
    // Must sit before the data.js/app.js <script> tags in document order —
    // app.js reads it synchronously at load, before any script tag that
    // comes after app.js in the saved HTML would have been parsed yet.
    document.body.insertBefore(el, document.body.firstChild);
  }
  el.textContent = JSON.stringify(state);
}

var saveTimer = null;
function scheduleSave(){
  var pill = document.getElementById('savePill');
  pill.textContent = 'Saving…'; pill.classList.add('show');
  clearTimeout(saveTimer);
  saveTimer = setTimeout(function(){
    (async function(){
      try{
        persistStateToDom();
        var artifact = (window.claude && window.claude.use) ? await window.claude.use('artifact') : null;
        if (artifact){
          await artifact.publish('<!doctype html>\n' + document.documentElement.outerHTML);
          pill.textContent = 'Saved';
        } else {
          pill.textContent = 'Saved on this device';
        }
      } catch(e){
        pill.textContent = 'Saved on this device';
      }
      setTimeout(function(){ pill.classList.remove('show'); }, 1200);
    })();
  }, 700);
}

// ---------- handlers ----------
function attachHandlers(){
  document.querySelectorAll('#dayList input[type=checkbox]').forEach(function(cb){
    cb.onchange = function(){
      state.cooked[this.getAttribute('data-key')] = this.checked;
      renderPlan(); renderSeasonStrip(); attachHandlers(); scheduleSave();
    };
  });
  document.querySelectorAll('#groceryList input[type=checkbox]').forEach(function(cb){
    cb.onchange = function(){
      state.grocery[this.getAttribute('data-gkey')] = this.checked;
      renderGroceries(); attachHandlers(); scheduleSave();
    };
  });
  var gb = document.getElementById('gb-budgeted'), gs = document.getElementById('gb-spent');
  gb.oninput = function(){ state.weeks[state.currentWeek].gbudgeted = gb.value; renderGroceries(); renderSeasonStrip(); attachHandlers(); scheduleSave(); };
  gs.oninput = function(){ state.weeks[state.currentWeek].gspent = gs.value; renderGroceries(); renderSeasonStrip(); attachHandlers(); scheduleSave(); };
  var useEst = document.getElementById('useEstimateBtn');
  if (useEst) useEst.onclick = function(){
    state.weeks[state.currentWeek].gbudgeted = weekMarketEstimate().toFixed(2);
    renderGroceries(); renderSeasonStrip(); attachHandlers(); scheduleSave();
  };
  document.querySelectorAll('#trackerBody input').forEach(function(inp){
    inp.oninput = function(){
      var idx = parseInt(this.getAttribute('data-tidx'),10);
      var field = this.hasAttribute('data-actual') ? 'actual' : 'planned';
      state.weeks[state.currentWeek].tracker[idx][field] = this.value;
      renderTracker(); attachHandlers(); scheduleSave();
    };
  });
  document.getElementById('prevWeek').onclick = function(){
    if (state.currentWeek>0){ state.currentWeek--; renderAll(); scheduleSave(); }
  };
  document.getElementById('nextWeek').onclick = function(){
    if (state.currentWeek<N_WEEKS-1){ state.currentWeek++; renderAll(); scheduleSave(); }
  };
  document.getElementById('startDateInput').onchange = function(){
    if (this.value){ state.startDate = this.value; renderAll(); scheduleSave(); }
  };
  document.getElementById('weekJump').onchange = function(){
    goToWeek(parseInt(this.value, 10));
  };
  document.querySelectorAll('.ov-viewbtn').forEach(function(btn){
    btn.onclick = function(){ goToWeek(parseInt(this.getAttribute('data-week'), 10), {switchTab:true}); };
  });
  document.querySelectorAll('.tabbtn').forEach(function(btn){
    btn.onclick = function(){ setActiveTab(this.getAttribute('data-tab'), true); };
  });
  document.getElementById('editPrefsBtn').onclick = function(){
    forceShowOnboard = true;
    updateOnboardVisibility();
  };
  document.getElementById('obSaveBtn').onclick = finishOnboarding;
  document.getElementById('obSkipBtn').onclick = function(){
    state.prefsLiked = {};
    state.prefsDisliked = {};
    finishOnboarding();
  };
}

// ---------- PWA install ----------
var deferredInstallPrompt = null;
window.addEventListener('beforeinstallprompt', function(e){
  e.preventDefault();
  deferredInstallPrompt = e;
  document.getElementById('installBanner').classList.add('show');
});
document.addEventListener('DOMContentLoaded', function(){
  var btn = document.getElementById('installBtn');
  if (btn) btn.onclick = function(){
    if (!deferredInstallPrompt) return;
    deferredInstallPrompt.prompt();
    deferredInstallPrompt.userChoice.then(function(){
      deferredInstallPrompt = null;
      document.getElementById('installBanner').classList.remove('show');
    });
  };
});
if ('serviceWorker' in navigator){
  window.addEventListener('load', function(){
    navigator.serviceWorker.register('service-worker.js').catch(function(){});
  });
}

renderAll();
updateOnboardVisibility();
initTabSwipe();
updateTabUI(false);
