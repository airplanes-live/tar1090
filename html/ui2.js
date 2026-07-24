"use strict";

(function() {

const newUI = {
    active: false,
    init: init,
    focusSearch: focusSearch,
    syncButton: syncButton,
    syncToggle: syncToggle,
};
TAR.newUI = newUI;

let registry = [];
let byStateBtn = {};
let byToggleKey = {};
let openMenuId = null;
let modalOpen = false;
let modalBuilt = false;
let sheetOpen = false;
let suggestSel = -1;
let suggestList = [];
let suggestTimer = null;

function svg(inner) {
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' + inner + '</svg>';
}
function svgFill(inner) {
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" stroke="none">' + inner + '</svg>';
}
const I = {
    search:   svg('<circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.5" y2="16.5"/>'),
    menu:     svg('<line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>'),
    close:    svg('<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>'),
    check:    svg('<polyline points="20 6 9 17 4 12"/>'),
    caret:    svg('<polyline points="6 9 12 15 18 9"/>'),
    chevR:    svg('<polyline points="9 6 15 12 9 18"/>'),
    plane:    svgFill('<path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/>'),
    pin:      svg('<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>'),
    tag:      svg('<path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/>'),
    detail:   svg('<path d="M4 6h16M4 12h10M4 18h6"/>'),
    clock:    svg('<circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 15 14"/>'),
    moon:     svg('<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/>'),
    monitor:  svg('<rect x="2" y="4" width="20" height="13" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>'),
    layers:   svg('<polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 12 12 17 22 12"/><polyline points="2 17 12 22 22 17"/>'),
    home:     svg('<path d="M3 10l9-7 9 7v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>'),
    follow:   svg('<circle cx="12" cy="12" r="7"/><line x1="12" y1="2" x2="12" y2="5"/><line x1="12" y1="19" x2="12" y2="22"/><line x1="2" y1="12" x2="5" y2="12"/><line x1="19" y1="12" x2="22" y2="12"/>'),
    shield:   svg('<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>'),
    isolate:  svg('<path d="M3 7V5a2 2 0 0 1 2-2h2"/><path d="M17 3h2a2 2 0 0 1 2 2v2"/><path d="M21 17v2a2 2 0 0 1-2 2h-2"/><path d="M7 21H5a2 2 0 0 1-2-2v-2"/><circle cx="12" cy="12" r="3"/>'),
    route:    svg('<circle cx="6" cy="19" r="2.5"/><circle cx="18" cy="5" r="2.5"/><path d="M8.5 19H15a3.5 3.5 0 0 0 0-7H9a3.5 3.5 0 0 1 0-7h6.5"/>'),
    copy:     svg('<rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>'),
    ghost:    svg('<path d="M12 2a7 7 0 0 0-7 7v12l3-2 2 2 2-2 2 2 2-2 3 2V9a7 7 0 0 0-7-7z"/><circle cx="9.5" cy="10" r="0.5" fill="currentColor"/><circle cx="14.5" cy="10" r="0.5" fill="currentColor"/>'),
    shuffle:  svg('<polyline points="16 3 21 3 21 8"/><line x1="4" y1="20" x2="21" y2="3"/><polyline points="21 16 21 21 16 21"/><line x1="15" y1="15" x2="21" y2="21"/><line x1="4" y1="4" x2="9" y2="9"/>'),
    history:  svg('<path d="M3 3v5h5"/><path d="M3.05 13A9 9 0 1 0 6 5.3L3 8"/><polyline points="12 7 12 12 15 15"/>'),
    gear:     svg('<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>'),
    maximize: svg('<path d="M8 3H5a2 2 0 0 0-2 2v3"/><path d="M16 3h3a2 2 0 0 1 2 2v3"/><path d="M16 21h3a2 2 0 0 0 2-2v-3"/><path d="M8 21H5a2 2 0 0 1-2-2v-3"/>'),
    panel:    svg('<rect x="3" y="3" width="18" height="18" rx="2"/><line x1="15" y1="3" x2="15" y2="21"/>'),
    funnel:   svg('<polygon points="22 3 2 3 10 12.5 10 19 14 21 14 12.5 22 3"/>'),
    columns:  svg('<rect x="3" y="3" width="18" height="18" rx="2"/><line x1="9" y1="3" x2="9" y2="21"/><line x1="15" y1="3" x2="15" y2="21"/>'),
    eraser:   svg('<path d="M20 20H7L3 16a2 2 0 0 1 0-2.8l9.6-9.6a2 2 0 0 1 2.8 0l5 5a2 2 0 0 1 0 2.8L13 19"/>'),
    rows:     svg('<line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/><polyline points="17 15 21 18 17 21"/>'),
    star:     svg('<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>'),
    ruler:    svg('<path d="M21.3 8.7l-6-6a1 1 0 0 0-1.4 0L2.7 13.9a1 1 0 0 0 0 1.4l6 6a1 1 0 0 0 1.4 0L21.3 10.1a1 1 0 0 0 0-1.4z"/><line x1="7.5" y1="10.5" x2="9" y2="12"/><line x1="10.5" y1="7.5" x2="12" y2="9"/><line x1="13.5" y1="4.5" x2="15" y2="6"/>'),
};

window.addEventListener('keydown', function(e) {
    if (!newUI.active) return;
    if (e.key !== 'Escape' && e.key !== 'Esc') return;
    if (suggestVisible()) {
        closeSuggest();
        e.preventDefault();
        return;
    }
    if (document.body.classList.contains('ui2-search-open')) {
        collapseSearch();
        jQuery('#ui2_search_input').blur();
        e.preventDefault();
        return;
    }
    if (ctxOpen) { closeCtxMenu(); e.preventDefault(); return; }
    if (modalOpen) { closeModal(); e.preventDefault(); return; }
    if (sheetOpen) { closeSheet(); e.preventDefault(); return; }
    if (openMenuId) { closeMenus(); e.preventDefault(); return; }
    if (newUI.measureActive) { toggleMeasure(false); e.preventDefault(); return; }
}, true);

function uiEnabled() {
    if (usp.has('legacyUI')) return false;
    if (usp.has('newUI')) return true;
    return loStore['ui2_optin'] === 'true';
}

function optInReload() {
    loStore['ui2_optin'] = 'true';
    location.reload();
}

function initLegacyOptIn() {
    const right = document.getElementById('settingsRight');
    if (!right) return;
    const row = document.createElement('div');
    row.className = 'settingsOptionContainer';
    const btn = document.createElement('button');
    btn.className = 'formButton';
    btn.textContent = 'Try the new UI';
    btn.addEventListener('click', optInReload);
    row.appendChild(btn);
    right.insertBefore(row, right.firstChild);

    initLegacyBanner();
}

function initLegacyBanner() {
    if (usp.has('legacyUI')) return;
    if (typeof window.Android !== 'undefined') return; // embedded native app, has its own UI overlay
    if (typeof hideButtons !== 'undefined' && hideButtons) return;
    if (loStore['ui2_optin'] != null || loStore['ui2_banner_dismissed']) return;

    const banner = document.createElement('div');
    banner.id = 'ui2_banner';

    const tryBtn = document.createElement('button');
    tryBtn.id = 'ui2_banner_try';
    tryBtn.innerHTML = I.plane + '<span>Try the new UI</span>';
    tryBtn.addEventListener('click', optInReload);

    const closeBtn = document.createElement('button');
    closeBtn.id = 'ui2_banner_close';
    closeBtn.title = 'Dismiss';
    closeBtn.innerHTML = I.close;
    closeBtn.addEventListener('click', function() {
        loStore['ui2_banner_dismissed'] = 'true';
        banner.remove();
    });

    banner.appendChild(tryBtn);
    banner.appendChild(closeBtn);
    document.body.appendChild(banner);
}

function init() {
    if (newUI.active) return;
    if (!uiEnabled()) {
        initLegacyOptIn();
        return;
    }

    document.body.classList.add('ui2');

    buildRegistry();
    buildBar();
    buildMenus();
    buildSheet();
    buildModalShell();
    restructureSidebar();
    relocateFilterForms();
    loadBookmarks();
    loadRecents();
    buildStar();
    renderBookmarks();
    buildMeasureReadout();
    initCtrlMultiSelect();
    initTableSortIndicator();
    seedStates();
    updateFilterBadge();

    if (typeof hideButtons !== 'undefined' && hideButtons) {
        jQuery('.ui2-chrome').hide();
    }

    newUI.active = true;
}

function buildRegistry() {
    const items = [
        // View
        { menu: 'view', id: 'labels',   icon: I.tag,     label: 'Aircraft labels',              run: () => toggleLabels(),         stateBtn: '#L', key: 'l' },
        { menu: 'view', id: 'detail',   icon: I.detail,  label: 'Label detail',                 run: () => toggleExtendedLabels(), stateBtn: '#O', key: 'o',
            badge: () => (g.extendedLabels > 0 ? 'level ' + g.extendedLabels + '/3' : ''), sub: 'cycles 4 levels' },
        { menu: 'view', id: 'tracktimes', icon: I.clock, label: 'Timestamps on tracks',         run: () => toggleTrackLabels(),    stateBtn: '#K', key: 'k' },
        { menu: 'view', id: 'dim',      icon: I.moon,    label: 'Dim map',                      run: () => toggles['MapDim'] && toggles['MapDim'].toggle(), toggleKey: 'MapDim', key: 'b' },
        { menu: 'view', id: 'inview',   icon: I.monitor, label: 'List only aircraft on screen', run: () => toggleTableInView(),    stateBtn: '#V', key: 'v',
            showIf: () => !globeIndex },
        { menu: 'view', sep: true },
        { menu: 'view', id: 'reset',    icon: I.home,    label: 'Reset map view',               run: () => resetMap(),             action: true, key: 'h' },
        { menu: 'view', id: 'follow',   icon: I.follow,  label: 'Follow selected aircraft',     run: () => toggleFollow(),         stateBtn: '#F', key: 'f' },

        // Filters
        { menu: 'filters', id: 'military', icon: I.shield,  label: 'Military only',             run: () => toggleMilitary(),       stateBtn: '#U', key: 'u' },
        { menu: 'filters', id: 'isolate',  icon: I.isolate, label: 'Isolate selected aircraft', run: () => toggleIsolation(),      stateBtn: '#I', key: 'i' },

        // Tools
        { menu: 'tools', id: 'alltracks', icon: I.route,   label: 'Show tracks for all aircraft', key: 't', stateBtn: '#T',
            run: () => { (typeof SelectedAllPlanes !== 'undefined' && SelectedAllPlanes) ? deselectAllPlanes() : selectAllPlanes(); } },
        { menu: 'tools', id: 'multi',     icon: I.copy,    label: 'Select multiple aircraft',   run: () => toggleMultiSelect(),    stateBtn: '#M', key: 'm' },
        { menu: 'tools', id: 'persist',   icon: I.ghost,   label: 'Keep faded aircraft visible', run: () => togglePersistence(),   stateBtn: '#P', key: 'p' },
        { menu: 'tools', id: 'random',    icon: I.shuffle, label: 'Follow a random aircraft',   run: () => followRandomPlane(),    action: true, key: 'r' },
        { menu: 'tools', sep: true },
        { menu: 'tools', id: 'measure',   icon: I.ruler,   label: 'Measure distance',           run: () => { closeMenus(); closeSheet(); toggleMeasure(); } },
    ];
    registry = items;
    byStateBtn = {};
    byToggleKey = {};
    for (const it of items) {
        if (it.stateBtn) byStateBtn[it.stateBtn] = it;
        if (it.toggleKey) byToggleKey[it.toggleKey] = it;
    }
}

function buildBar() {
    const bar = jQuery(
        '<div id="ui2_bar" class="ui2-chrome">'
        + '  <button id="ui2_hamburger" type="button" aria-label="Menu" title="Menu"><span class="ui2-icon">' + I.menu + '</span></button>'
        + '  <form id="ui2_search_form" role="search" autocomplete="off">'
        + '    <span class="ui2-icon">' + I.search + '</span>'
        + '    <input id="ui2_search_input" type="text" maxlength="128" autocomplete="off" spellcheck="false"'
        + '      placeholder="Search flight, reg, hex, type — or airport / lat,lon"'
        + '      title="Examples: UAL123 · N12345 · a1b2c3 · B738 · KATL · 33.64,-84.43 — comma-separate multiple aircraft. Press / to focus.">'
        + '    <button id="ui2_search_clear" type="button" aria-label="Clear search" title="Clear search"><span class="ui2-icon">' + I.close + '</span></button>'
        + '    <div id="ui2_suggest" role="listbox"></div>'
        + '  </form>'
        + '  <nav id="ui2_menus">'
        + '    <button id="ui2_menu_view_btn" type="button" data-menu="view"><span class="ui2-icon">' + I.tag + '</span><span class="ui2-menubtn-label">View</span><span class="ui2-icon">' + I.caret + '</span></button>'
        + '    <button id="ui2_menu_filters_btn" type="button" data-menu="filters"><span class="ui2-icon">' + I.funnel + '</span><span class="ui2-menubtn-label">Filters</span><span class="ui2-badge" id="ui2_filter_badge"></span><span class="ui2-icon">' + I.caret + '</span></button>'
        + '    <button id="ui2_menu_tools_btn" type="button" data-menu="tools"><span class="ui2-icon">' + I.route + '</span><span class="ui2-menubtn-label">Tools</span><span class="ui2-icon">' + I.caret + '</span></button>'
        + '  </nav>'
        + '  <div id="ui2_actions">'
        + '    <button id="ui2_home" type="button" aria-label="Reset map view" title="Home / Reset map view (H)"><span class="ui2-icon">' + I.home + '</span></button>'
        + '    <button id="ui2_bookmarks_btn" type="button" data-menu="bookmarks" aria-label="Bookmarks" title="Bookmarks"><span class="ui2-icon">' + I.star + '</span></button>'
        + '    <button id="ui2_replay" type="button" aria-label="Replay history" title="Replay history (Y)"><span class="ui2-icon">' + I.history + '</span></button>'
        + '    <button id="ui2_layers" type="button" aria-label="Map layers" title="Map layers"><span class="ui2-icon">' + I.layers + '</span></button>'
        + '    <button id="ui2_settings_btn" type="button" aria-label="Settings" title="Settings"><span class="ui2-icon">' + I.gear + '</span></button>'
        + '    <button id="ui2_fullscreen" type="button" aria-label="Fullscreen" title="Fullscreen" style="display: none;"><span class="ui2-icon">' + I.maximize + '</span></button>'
        + '    <button id="ui2_sidebar_btn" type="button" aria-label="Aircraft list" title="Aircraft list"><span class="ui2-icon">' + I.panel + '</span></button>'
        + '  </div>'
        + '</div>'
    );
    jQuery('#map_container').prepend(bar);

    jQuery('#map_container').append('<div id="ui2_toast" class="ui2-chrome"></div>');

    jQuery('#ui2_hamburger').on('click', function() { this.blur(); openSheet(); });

    jQuery('#ui2_home').on('click', function() { this.blur(); resetMap(); });
    jQuery('#ui2_replay').on('click', function() { this.blur(); toggleReplay(); });
    jQuery('#ui2_layers').on('click', function() { this.blur(); openLayerSwitcher(); });
    jQuery('#ui2_settings_btn').on('click', function() { this.blur(); openModal(); });
    jQuery('#ui2_sidebar_btn').on('click', function() { this.blur(); toggles['sidebar_visible'] && toggles['sidebar_visible'].toggle(); });

    if (typeof onMobile !== 'undefined' && onMobile) {
        jQuery('#ui2_fullscreen').show().on('click', function() {
            this.blur();
            if (!document.fullscreenElement) {
                document.documentElement.requestFullscreen();
            } else if (document.exitFullscreen) {
                document.exitFullscreen();
            }
        });
    }

    jQuery('#ui2_bar button[data-menu]').on('click', function() {
        const id = this.getAttribute('data-menu');
        (openMenuId === id) ? closeMenus() : openMenu(id);
        this.blur();
    });

    const input = jQuery('#ui2_search_input');
    jQuery('#ui2_search_form').on('submit', function(e) {
        e.preventDefault();
        if (suggestSel >= 0 && suggestList[suggestSel]) {
            pickSuggestion(suggestList[suggestSel]);
        } else {
            doSearch(input.val());
        }
        return false;
    });
    jQuery('#ui2_search_clear').on('click', function() {
        input.val('');
        jQuery('#ui2_search_form').removeClass('ui2-has-text');
        closeSuggest();
        onSearchClear();
        hideSearchWarning();
        input.focus();
    });
    input.on('input', function() {
        jQuery('#ui2_search_form').toggleClass('ui2-has-text', !!this.value);
        clearTimeout(suggestTimer);
        const v = this.value.trim();
        if (!v) { closeSuggest(); showRecents(); return; }
        if (v.length < 2 || v.indexOf(',') >= 0) { closeSuggest(); return; }
        suggestTimer = setTimeout(() => showSuggestions(v), 150);
    });
    input.on('keydown', function(e) {
        if (e.defaultPrevented) return;
        if (!suggestVisible()) return;
        if (e.key === 'ArrowDown') { moveSuggestSel(1); e.preventDefault(); }
        else if (e.key === 'ArrowUp') { moveSuggestSel(-1); e.preventDefault(); }
    });
    input.on('focus', function() {
        if (isNarrow()) expandSearch();
        if (!this.value.trim()) showRecents();
    });
    input.on('blur', function() {
        setTimeout(() => {
            closeSuggest();
            if (isNarrow() && !input.val()) collapseSearch();
        }, 200);
    });
    jQuery('#ui2_search_form').on('click', function(e) {
        if (isNarrow() && !this.classList.contains('ui2-expanded')) {
            expandSearch();
            input.focus();
            e.preventDefault();
        }
    });

    document.addEventListener('pointerdown', function(e) {
        if (ctxOpen && !(e.target.closest && e.target.closest('#ui2_ctx'))) closeCtxMenu();
        if (!openMenuId) return;
        if (e.target.closest && (e.target.closest('.ui2-menu') || e.target.closest('[data-menu]'))) return;
        closeMenus();
    }, true);
}

function isNarrow() {
    return window.innerWidth < 768;
}
function expandSearch() {
    jQuery('#ui2_search_form').addClass('ui2-expanded');
    document.body.classList.add('ui2-search-open');
}
function collapseSearch() {
    jQuery('#ui2_search_form').removeClass('ui2-expanded');
    document.body.classList.remove('ui2-search-open');
}
function focusSearch() {
    if (isNarrow()) expandSearch();
    const el = document.getElementById('ui2_search_input');
    if (el) { el.focus(); el.select(); }
}

function openLayerSwitcher() {
    const btn = document.querySelector('.layer-switcher button');
    if (btn) {
        btn.click();
    } else {
        jQuery('.layer-switcher > button').show();
    }
}

function buildMenus() {
    const bar = jQuery('#ui2_bar');

    const bm = jQuery(
        '<div class="ui2-menu" id="ui2_menu_bookmarks" role="menu">'
        + '<div class="ui2-menu-title">Bookmarks</div>'
        + '<div id="ui2_bm_list"></div>'
        + '<div class="ui2-menu-sep"></div>'
        + '<div class="ui2-bm-foot" id="ui2_bm_foot"></div>'
        + '</div>');
    bar.append(bm);

    for (const menuId of ['view', 'filters', 'tools']) {
        const panel = jQuery('<div class="ui2-menu" id="ui2_menu_' + menuId + '" role="menu"></div>');
        for (const it of registry) {
            if (it.menu !== menuId) continue;
            if (it.sep) { panel.append('<div class="ui2-menu-sep"></div>'); continue; }
            panel.append(renderItem(it, 'menu'));
        }
        if (menuId === 'filters') {
            panel.append('<div class="ui2-menu-sep"></div>');
            panel.append('<div class="ui2-menu-title">Filter by</div>');
            panel.append('<div id="ui2_filters_forms"></div>');
            const clear = jQuery(
                '<div class="ui2-item" role="menuitem"><span class="ui2-icon">' + I.eraser + '</span>'
                + '<span class="ui2-item-label">Clear all filters</span></div>');
            clear.on('click', function() {
                clearAllFilters();
            });
            panel.append(clear);
            panel.on('submit', 'form', () => setTimeout(updateFilterBadge, 50));
            panel.on('click', 'button, .ui-selectee, li', () => setTimeout(updateFilterBadge, 50));
        }
        bar.append(panel);
    }
}

function renderItem(it, where) {
    const row = jQuery(
        '<div class="ui2-item" role="menuitem" data-item="' + it.id + '">'
        + '<span class="ui2-icon">' + (it.icon || '') + '</span>'
        + '<span class="ui2-item-label">' + it.label + '</span>'
        + '<span class="ui2-item-badge"></span>'
        + (it.key ? '<span class="ui2-kbd">' + it.key + '</span>' : '')
        + '<span class="ui2-icon ui2-item-check">' + I.check + '</span>'
        + '</div>'
    );
    row.on('click', function() {
        try { it.run(); } catch (e) { console.error('ui2 action failed', it.id, e); }
        if (it.action) {
            closeMenus();
            if (where === 'sheet') closeSheet();
        } else if (where === 'sheet') {
            setTimeout(renderSheetStates, 50);
        }
    });
    if (!it.action) it['_row_' + where] = row[0];
    updateRow(it);
    return row;
}

function updateRow(it) {
    if (it.sep || it.action) return;
    for (const where of ['menu', 'sheet']) {
        const el = it['_row_' + where];
        if (!el) continue;
        el.classList.toggle('ui2-on', !!it._s);
        const badgeEl = el.querySelector('.ui2-item-badge');
        if (badgeEl) badgeEl.textContent = (it.badge ? (it.badge() || '') : '');
    }
}

function openMenu(id) {
    closeMenus();
    const panel = document.getElementById('ui2_menu_' + id);
    const btn = document.querySelector('#ui2_bar button[data-menu="' + id + '"]');
    if (!panel || !btn) return;
    if (id === 'bookmarks') refreshBookmarkStatus();
    for (const it of registry) {
        if (it.menu === id && it.showIf && it['_row_menu']) {
            it['_row_menu'].style.display = it.showIf() ? '' : 'none';
        }
    }
    const left = Math.max(4, Math.min(btn.offsetLeft, window.innerWidth - panel.offsetWidth - 8));
    panel.style.left = left + 'px';
    panel.classList.add('ui2-show');
    btn.classList.add('ui2-open');
    openMenuId = id;
    if (id === 'filters') updateFilterBadge();
}
function closeMenus() {
    if (!openMenuId) return;
    jQuery('.ui2-menu').removeClass('ui2-show');
    jQuery('#ui2_bar button[data-menu]').removeClass('ui2-open');
    openMenuId = null;
}

function clearAllFilters() {
    try { onResetAltitudeFilter(); } catch (e) { /* form may be missing */ }
    try { onResetSourceFilter(); } catch (e) {}
    try { onResetFlagFilter(); } catch (e) {}
    try { filter_list.forEach(f => f.reset()); } catch (e) {}
    if (typeof onlyMilitary !== 'undefined' && onlyMilitary) toggleMilitary();
    if (typeof onlySelected !== 'undefined' && onlySelected) toggleIsolation('off');
    updateFilterBadge();
}

function filterCount() {
    let n = 0;
    try {
        if (typeof filters_active !== 'undefined') n += filters_active.length;
        if (typeof PlaneFilter !== 'undefined' && PlaneFilter) {
            if (PlaneFilter.enabled) n++;
            if (PlaneFilter.sources && PlaneFilter.sources.length) n++;
            if (PlaneFilter.flagFilter && PlaneFilter.flagFilter.length) n++;
        }
        if (typeof onlyMilitary !== 'undefined' && onlyMilitary) n++;
        if (typeof onlySelected !== 'undefined' && onlySelected) n++;
    } catch (e) {}
    return n;
}
function updateFilterBadge() {
    const n = filterCount();
    const b = document.getElementById('ui2_filter_badge');
    if (!b) return;
    b.textContent = n;
    b.classList.toggle('ui2-show', n > 0);
}

function relocateFilterForms() {
    const host = document.getElementById('ui2_filters_forms');
    if (!host) return;
    for (const id of ['filterTable', 'filterTable2', 'filterTable3']) {
        const el = document.getElementById(id);
        if (el) host.appendChild(el);
    }
}

function syncButton(id, state) {
    if (id === '#F') {
        updateStar();
        const sp = (typeof SelectedPlane !== 'undefined') ? SelectedPlane : null;
        if (sp && sp.icao) {
            if (sp.icao !== lastViewedHex) {
                lastViewedHex = sp.icao;
                rememberPlane(sp);
            } else if (recentPlanes.length && recentPlanes[0].hex === sp.icao
                && recentPlanes[0].label === sp.icao.toUpperCase()
                && (sp.registration || (sp.flight && sp.flight.trim()))) {
                rememberPlane(sp);
            }
        }
    }
    const it = byStateBtn[id];
    if (!it) return;
    const s = !!state;
    const x = (id === '#O') ? (g.extendedLabels | 0) : 0;
    if (it._s === s && it._x === x) return;
    it._s = s;
    it._x = x;
    updateRow(it);
    if (id === '#U' || id === '#I') updateFilterBadge();
}

function syncToggle(key, state) {
    const it = byToggleKey[key];
    if (it) {
        const s = !!state;
        if (it._s === s) return;
        it._s = s;
        updateRow(it);
    }
}

function seedStates() {
    for (const it of registry) {
        if (it.sep || it.action) continue;
        if (it.stateBtn) {
            it._s = jQuery(it.stateBtn).hasClass('activeButton');
            if (it.stateBtn === '#O') it._x = (typeof g !== 'undefined' ? (g.extendedLabels | 0) : 0);
        } else if (it.toggleKey) {
            it._s = !!(toggles[it.toggleKey] && toggles[it.toggleKey].state);
        }
        updateRow(it);
    }
}

function doSearch(raw) {
    const term = (raw || '').trim();
    if (!term) return;
    closeSuggest();
    hideSearchWarning();

    if (/^-?\d+(\.\d+)?\s*,\s*-?\d+(\.\d+)?$/.test(term)) {
        onJumpInput = term;
        onJump();
        rememberSearch(term);
        blurSearch();
        return;
    }

    let results = [];
    try {
        results = findPlanes(term, 'byIcao', 'byCallsign', 'byReg', 'byType', false) || [];
    } catch (e) {
        try {
            const esc = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            results = findPlanes(esc, 'byIcao', 'byCallsign', 'byReg', 'byType', false) || [];
        } catch (e2) { results = []; }
    }
    if (results.length > 0) {
        if (haveTraces) {
            toggleIsolation('on');
            if (results.length < 100) getTrace(null, null, { list: results });
        }
        rememberSearch(term);
        blurSearch();
        return;
    }

    if (haveTraces && /^~?[a-f0-9]{6}$/i.test(term)) {
        rememberSearch(term);
        blurSearch();
        return;
    }

    if (/^[A-Za-z0-9]{3,4}$/.test(term)) {
        lookupAirport(term, function(found) {
            if (found) {
                onJumpInput = term;
                onJump();
                rememberSearch(term);
                blurSearch();
            } else {
                globalSearch(term);
            }
        });
        return;
    }

    globalSearch(term);
}

function globalFindAircraft(term) {
    if (typeof reApi === 'undefined' || !reApi) return Promise.resolve([]);
    const q = encodeURIComponent(term.trim());
    const get = (u) => fetch(u)
        .then(r => r.json())
        .then(d => (d.aircraft || []).map(a => a.hex))
        .catch(() => []);
    return Promise.all([
        get('re-api/?json&find_callsign=' + q),
        get('re-api/?json&find_reg=' + q),
    ]).then(parts => Array.from(new Set(parts.flat())));
}

function globalSearch(term) {
    globalFindAircraft(term).then(function(hexes) {
        if (hexes.length) {
            selectPlaneByHex(hexes[0], { noDeselect: hexes.length > 1, follow: true });
            for (let i = 1; i < hexes.length; i++) {
                selectPlaneByHex(hexes[i], { noDeselect: true, follow: false });
            }
            if (hexes.length > 1) toggleMultiSelect('on');
            rememberSearch(term);
            blurSearch();
        } else {
            notFound(term);
        }
    });
}

function lookupAirport(term, cb) {
    const code = term.trim().toUpperCase();
    if (g.airport_cache) {
        cb(!!g.airport_cache[code]);
        return;
    }
    jQuery.getJSON(databaseFolder + '/airport-coords.js')
        .done(function(data) { g.airport_cache = data; cb(!!g.airport_cache[code]); })
        .fail(function() { cb(false); });
}

function notFound(term) {
    showSearchWarning('No aircraft or airport matched "' + term
        + '". Callsign and registration search covers the whole network but needs an exact match.');
}

let recentSearches = [];
let recentPlanes = [];
let lastViewedHex = null;

function loadRecents() {
    try {
        const r = JSON.parse(loStore['ui2_recents'] || '{}');
        recentSearches = Array.isArray(r.s) ? r.s.slice(0, 5) : [];
        recentPlanes = Array.isArray(r.p) ? r.p.filter(p => p && p.hex).slice(0, 5) : [];
    } catch (e) { recentSearches = []; recentPlanes = []; }
}
function saveRecents() {
    try { loStore['ui2_recents'] = JSON.stringify({ s: recentSearches, p: recentPlanes }); } catch (e) {}
}
function rememberSearch(term) {
    recentSearches = [term].concat(recentSearches.filter(t => t !== term)).slice(0, 5);
    saveRecents();
}
function rememberPlane(p) {
    const flight = p.flight ? String(p.flight).trim() : '';
    const entry = { hex: p.icao, label: p.registration || flight || p.icao.toUpperCase() };
    recentPlanes = [entry].concat(recentPlanes.filter(x => x.hex !== p.icao)).slice(0, 5);
    saveRecents();
}

function showRecents() {
    if (!recentSearches.length && !recentPlanes.length) return;
    suggestList = [];
    suggestSel = -1;
    const box = jQuery('#ui2_suggest');
    box.empty();

    const addTitle = (label) => {
        const t = document.createElement('div');
        t.className = 'ui2-menu-title';
        t.textContent = label;
        box.append(t);
    };
    if (recentSearches.length) {
        addTitle('Recent searches');
        for (const term of recentSearches) {
            const row = document.createElement('div');
            row.className = 'ui2-suggest-row';
            const icon = document.createElement('span');
            icon.className = 'ui2-icon ui2-suggest-icon';
            icon.innerHTML = I.search;
            const label = document.createElement('span');
            label.textContent = term;
            row.appendChild(icon);
            row.appendChild(label);
            row.addEventListener('mousedown', function(e) {
                e.preventDefault();
                jQuery('#ui2_search_input').val(term);
                doSearch(term);
            });
            box.append(row);
        }
    }
    if (recentPlanes.length) {
        addTitle('Recently viewed');
        for (const p of recentPlanes) {
            const row = document.createElement('div');
            row.className = 'ui2-suggest-row';
            const icon = document.createElement('span');
            icon.className = 'ui2-icon ui2-suggest-icon';
            icon.innerHTML = I.plane;
            const label = document.createElement('span');
            label.className = 'ui2-suggest-main';
            label.textContent = p.label;
            const hex = document.createElement('span');
            hex.className = 'ui2-suggest-hex';
            hex.textContent = p.hex.toUpperCase();
            row.appendChild(icon);
            row.appendChild(label);
            row.appendChild(hex);
            row.addEventListener('mousedown', function(e) {
                e.preventDefault();
                closeSuggest();
                selectPlaneByHex(p.hex, { follow: true });
                blurSearch();
            });
            box.append(row);
        }
    }
    const clear = document.createElement('div');
    clear.className = 'ui2-suggest-row ui2-suggest-foot';
    clear.textContent = 'Clear recents';
    clear.addEventListener('mousedown', function(e) {
        e.preventDefault();
        recentSearches = [];
        recentPlanes = [];
        saveRecents();
        closeSuggest();
    });
    box.append(clear);
    box.addClass('ui2-show');
}

function blurSearch() {
    jQuery('#ui2_search_input').blur();
    if (isNarrow()) collapseSearch();
}

function scanPlanes(q) {
    const out = [];
    if (typeof g === 'undefined' || !g.planesOrdered) return out;
    const Q = q.toUpperCase();
    const arr = g.planesOrdered;
    for (let i = 0; i < arr.length; i++) {
        const p = arr[i];
        if (!p || !p.icao) continue;
        const flight = p.flight ? String(p.flight).trim().toUpperCase() : '';
        const reg = p.registration ? String(p.registration).toUpperCase() : '';
        const type = p.icaoType ? String(p.icaoType).toUpperCase() : '';
        const hex = String(p.icao).toUpperCase();
        if ((flight && flight.indexOf(Q) >= 0)
            || (reg && reg.indexOf(Q) >= 0)
            || (type && type.indexOf(Q) >= 0)
            || hex.indexOf(Q) >= 0) {
            out.push({ hex: p.icao, flight: flight, reg: reg, type: type });
            if (out.length >= 8) break;
        }
    }
    return out;
}

function ensureAirportCache() {
    if (g.airport_cache || g.airport_cache_loading) return;
    g.airport_cache_loading = true;
    jQuery.getJSON(databaseFolder + '/airport-coords.js')
        .done(function(data) {
            g.airport_cache = data;
            const v = jQuery('#ui2_search_input').val();
            const t = v ? v.trim() : '';
            if (t.length >= 2 && t.indexOf(',') < 0) showSuggestions(t);
        })
        .always(function() { g.airport_cache_loading = false; });
}

function scanAirports(q) {
    const out = [];
    const Q = q.toUpperCase();
    // Airport codes are 3-4 alphanumerics; skip longer/mixed queries so we
    // don't add noise once the user is clearly typing something else.
    if (!/^[A-Z0-9]{2,4}$/.test(Q)) return out;
    if (!g.airport_cache) { ensureAirportCache(); return out; }
    const cache = g.airport_cache;
    for (const code in cache) {
        if (code.indexOf(Q) === 0) {
            out.push({ kind: 'airport', code: code, coords: cache[code] });
            if (out.length >= 5) break;
        }
    }
    return out;
}

function showSuggestions(q) {
    const planes = scanPlanes(q);
    const airports = scanAirports(q);
    suggestList = planes.concat(airports);
    suggestSel = -1;
    const box = jQuery('#ui2_suggest');
    box.empty();
    if (!suggestList.length) { box.removeClass('ui2-show'); return; }
    planes.forEach(function(s) {
        const row = document.createElement('div');
        row.className = 'ui2-suggest-row';
        row.setAttribute('role', 'option');
        const main = document.createElement('span');
        main.className = 'ui2-suggest-main';
        main.textContent = s.flight || s.reg || s.hex.toUpperCase();
        const dim = document.createElement('span');
        dim.className = 'ui2-suggest-dim';
        dim.textContent = [s.reg, s.type].filter(Boolean).join(' · ');
        const hex = document.createElement('span');
        hex.className = 'ui2-suggest-hex';
        hex.textContent = s.hex.toUpperCase();
        row.appendChild(main);
        row.appendChild(dim);
        row.appendChild(hex);
        row.addEventListener('mousedown', function(e) { e.preventDefault(); pickSuggestion(s); });
        box.append(row);
    });
    if (airports.length) {
        const title = document.createElement('div');
        title.className = 'ui2-menu-title';
        title.textContent = 'Airports';
        box.append(title);
        airports.forEach(function(a) {
            const row = document.createElement('div');
            row.className = 'ui2-suggest-row';
            row.setAttribute('role', 'option');
            const icon = document.createElement('span');
            icon.className = 'ui2-icon ui2-suggest-icon';
            icon.innerHTML = I.pin;
            const main = document.createElement('span');
            main.className = 'ui2-suggest-main';
            main.textContent = a.code;
            row.appendChild(icon);
            row.appendChild(main);
            const c = a.coords;
            if (c && c.length >= 2) {
                const coord = document.createElement('span');
                coord.className = 'ui2-suggest-hex';
                coord.textContent = Number(c[0]).toFixed(2) + ', ' + Number(c[1]).toFixed(2);
                row.appendChild(coord);
            }
            row.addEventListener('mousedown', function(e) { e.preventDefault(); pickSuggestion(a); });
            box.append(row);
        });
    }
    const foot = document.createElement('div');
    foot.className = 'ui2-suggest-row ui2-suggest-foot';
    foot.textContent = 'Search everything for "' + q + '" ↵';
    foot.addEventListener('mousedown', function(e) { e.preventDefault(); doSearch(q); });
    box.append(foot);
    box.addClass('ui2-show');
}
function suggestVisible() {
    const el = document.getElementById('ui2_suggest');
    return !!(el && el.classList.contains('ui2-show'));
}
function closeSuggest() {
    jQuery('#ui2_suggest').removeClass('ui2-show').empty();
    suggestList = [];
    suggestSel = -1;
}
function moveSuggestSel(delta) {
    if (!suggestList.length) return;
    suggestSel = (suggestSel + delta + suggestList.length) % suggestList.length;
    jQuery('#ui2_suggest .ui2-suggest-row').removeClass('ui2-sel')
        .eq(suggestSel).addClass('ui2-sel');
}
function pickSuggestion(s) {
    closeSuggest();
    if (s.kind === 'airport') {
        onJumpInput = s.code;
        onJump();
        rememberSearch(s.code);
        blurSearch();
        return;
    }
    selectPlaneByHex(s.hex, { follow: true });
    blurSearch();
}

const BOOKMARK_LIMIT = 5;
let bookmarks = [];
let bookmarkStatus = {};
let bookmarkCheckTime = 0;
let lastStarState = null;

function loadBookmarks() {
    try { bookmarks = JSON.parse(loStore['ui2_bookmarks'] || '[]'); } catch (e) { bookmarks = []; }
    if (!Array.isArray(bookmarks)) bookmarks = [];
    bookmarks = bookmarks.filter(b => b && b.hex).slice(0, BOOKMARK_LIMIT);
}
function saveBookmarks() {
    try { loStore['ui2_bookmarks'] = JSON.stringify(bookmarks); } catch (e) {}
}
function isBookmarked(hex) {
    return bookmarks.some(b => b.hex === hex);
}

function setBookmark(p) {
    if (!p || !p.icao) return;
    const i = bookmarks.findIndex(b => b.hex === p.icao);
    if (i >= 0) {
        bookmarks.splice(i, 1);
        delete bookmarkStatus[p.icao];
    } else {
        if (bookmarks.length >= BOOKMARK_LIMIT) {
            showSearchWarning('Bookmark limit reached (' + BOOKMARK_LIMIT + ') — remove one from the bookmarks list first.');
            return;
        }
        const flight = p.flight ? String(p.flight).trim() : '';
        bookmarks.push({
            hex: p.icao,
            label: p.registration || flight || p.icao.toUpperCase(),
            sub: [flight, p.icaoType].filter(Boolean).join(' · '),
        });
        bookmarkStatus[p.icao] = 'active';
    }
    saveBookmarks();
    lastStarState = null;
    updateStar();
    renderBookmarks();
}
function toggleBookmark() {
    if (typeof SelectedPlane !== 'undefined' && SelectedPlane) setBookmark(SelectedPlane);
}

function buildStar() {
    const callsign = document.getElementById('selected_callsign');
    if (!callsign || !callsign.parentElement) return;
    const star = document.createElement('span');
    star.id = 'ui2_bookmark_star';
    star.title = 'Bookmark this aircraft (up to ' + BOOKMARK_LIMIT + ')';
    star.innerHTML = I.star;
    star.addEventListener('click', function(e) {
        e.stopPropagation();
        toggleBookmark();
    });
    callsign.parentElement.appendChild(star);
}
function updateStar() {
    const el = document.getElementById('ui2_bookmark_star');
    if (!el) return;
    const p = (typeof SelectedPlane !== 'undefined') ? SelectedPlane : null;
    const starred = !!(p && isBookmarked(p.icao));
    if (starred === lastStarState) return;
    lastStarState = starred;
    el.classList.toggle('ui2-starred', starred);
}

function refreshBookmarkStatus(force) {
    if (!bookmarks.length) { renderBookmarks(); return; }
    if (!force && Date.now() - bookmarkCheckTime < 15000) { renderBookmarks(); return; }
    bookmarkCheckTime = Date.now();
    for (const b of bookmarks) bookmarkStatus[b.hex] = bookmarkStatus[b.hex] || 'unknown';
    renderBookmarks();

    const finish = () => renderBookmarks();
    if (typeof reApi !== 'undefined' && reApi) {
        fetch('re-api/?json&find_hex=' + bookmarks.map(b => b.hex).join(','))
            .then(r => r.json())
            .then(d => {
                const live = {};
                for (const a of (d.aircraft || [])) {
                    live[a.hex] = (a.seen == null || a.seen < 60);
                }
                for (const b of bookmarks) bookmarkStatus[b.hex] = live[b.hex] ? 'active' : 'inactive';
                finish();
            })
            .catch(() => { localBookmarkStatus(); finish(); });
    } else {
        localBookmarkStatus();
        finish();
    }
}
function localBookmarkStatus() {
    for (const b of bookmarks) {
        const p = (typeof g !== 'undefined' && g.planesOrdered)
            ? g.planesOrdered.find(p => p && p.icao === b.hex) : null;
        bookmarkStatus[b.hex] = (p && p.seen != null && p.seen < 60) ? 'active' : 'unknown';
    }
}

function renderBookmarks() {
    const host = document.getElementById('ui2_bm_list');
    if (!host) return;
    host.textContent = '';
    if (!bookmarks.length) {
        const empty = document.createElement('div');
        empty.className = 'ui2-bm-empty';
        empty.textContent = 'No bookmarks yet. Select an aircraft and tap the star next to its callsign.';
        host.appendChild(empty);
    }
    for (const b of bookmarks) {
        const row = document.createElement('div');
        row.className = 'ui2-bm-row';
        const status = bookmarkStatus[b.hex] || 'unknown';
        const dot = document.createElement('span');
        dot.className = 'ui2-bm-status ui2-bm-' + status;
        dot.innerHTML = I.plane;
        dot.title = status === 'active' ? 'Live now' : (status === 'inactive' ? 'Not currently seen' : 'Checking…');
        const label = document.createElement('span');
        label.className = 'ui2-bm-label';
        label.textContent = b.label;
        const sub = document.createElement('span');
        sub.className = 'ui2-bm-sub';
        sub.textContent = b.sub || '';
        const hex = document.createElement('span');
        hex.className = 'ui2-bm-hex';
        hex.textContent = b.hex.toUpperCase();
        const remove = document.createElement('button');
        remove.className = 'ui2-bm-remove';
        remove.title = 'Remove bookmark';
        remove.innerHTML = I.close;
        remove.addEventListener('click', function(e) {
            e.stopPropagation();
            bookmarks = bookmarks.filter(x => x.hex !== b.hex);
            delete bookmarkStatus[b.hex];
            saveBookmarks();
            lastStarState = null;
            updateStar();
            renderBookmarks();
        });
        row.appendChild(dot);
        row.appendChild(label);
        row.appendChild(sub);
        row.appendChild(hex);
        row.appendChild(remove);
        row.addEventListener('click', function() {
            closeMenus();
            selectPlaneByHex(b.hex, { follow: true });
        });
        host.appendChild(row);
    }
    const foot = document.getElementById('ui2_bm_foot');
    if (foot) foot.textContent = bookmarks.length + ' of ' + BOOKMARK_LIMIT + ' bookmarks';
}

function toggleReplay() {
    const wasOpen = (typeof showingReplayBar !== 'undefined' && showingReplayBar);
    showReplayBar();
    if (wasOpen) return;
    loadReplay(new Date());
    let tries = 0;
    const kick = setInterval(function() {
        if (!showingReplayBar || (replay && replay.playing)) { clearInterval(kick); return; }
        if (replay && typeof replayPlanes !== 'undefined' && Object.keys(replayPlanes).length) {
            jQuery('#replayPlay').trigger('click');
            clearInterval(kick);
        } else if (++tries > 40) {
            clearInterval(kick);
        }
    }, 250);
}
g
let measureLayer = null;
let measureSource = null;
let measurePoints = [];
let measureMoveGate = 0;
let measureFrozen = false;

function gcDistance(a, b) {
    const R = 6371008.8, D = Math.PI / 180;
    const s = Math.sin((b[1] - a[1]) * D / 2) ** 2
        + Math.cos(a[1] * D) * Math.cos(b[1] * D) * Math.sin((b[0] - a[0]) * D / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(s));
}
function gcBearing(a, b) {
    const D = Math.PI / 180;
    const y = Math.sin((b[0] - a[0]) * D) * Math.cos(b[1] * D);
    const x = Math.cos(a[1] * D) * Math.sin(b[1] * D)
        - Math.sin(a[1] * D) * Math.cos(b[1] * D) * Math.cos((b[0] - a[0]) * D);
    return Math.round((Math.atan2(y, x) / D + 360) % 360);
}

function initMeasureLayer() {
    if (measureLayer) return;
    measureSource = new ol.source.Vector();
    measureLayer = new ol.layer.Vector({
        source: measureSource,
        zIndex: 300,
        updateWhileInteracting: true,
        updateWhileAnimating: true,
    });
    OLMap.addLayer(measureLayer);
}

function measureLineStyle(dashed) {
    return [
        new ol.style.Style({ stroke: new ol.style.Stroke({ color: 'rgba(0,0,0,0.75)', width: 5, lineDash: dashed ? [7, 7] : undefined }) }),
        new ol.style.Style({ stroke: new ol.style.Stroke({ color: '#f7c948', width: 3, lineDash: dashed ? [7, 7] : undefined }) }),
    ];
}

function redrawMeasure(cursor) {
    if (!measureSource) return;
    measureSource.clear(true);
    const pts = measurePoints.slice();
    if (cursor && pts.length) pts.push(cursor);

    for (const p of measurePoints) {
        const f = new ol.Feature(new ol.geom.Point(ol.proj.fromLonLat(p)));
        f.setStyle(new ol.style.Style({
            image: new ol.style.Circle({
                radius: 5 * globalScale,
                fill: new ol.style.Fill({ color: '#f7c948' }),
                stroke: new ol.style.Stroke({ color: 'rgba(0,0,0,0.75)', width: 2 }),
            }),
        }));
        measureSource.addFeature(f);
    }

    let total = 0;
    for (let i = 1; i < pts.length; i++) {
        const a = pts[i - 1], b = pts[i];
        const meters = gcDistance(a, b);
        total += meters;
        const preview = (cursor && i === pts.length - 1);
        const seg = new ol.Feature(new ol.geom.LineString([ol.proj.fromLonLat(a), ol.proj.fromLonLat(b)]));
        seg.setStyle(measureLineStyle(preview));
        measureSource.addFeature(seg);
        const mid = ol.proj.fromLonLat([(a[0] + b[0]) / 2, (a[1] + b[1]) / 2]);
        const label = new ol.Feature(new ol.geom.Point(mid));
        label.setStyle(new ol.style.Style({
            text: new ol.style.Text({
                text: format_distance_long(meters, DisplayUnits),
                font: 'bold ' + Math.round(12 * globalScale) + 'px sans-serif',
                fill: new ol.style.Fill({ color: '#fff' }),
                stroke: new ol.style.Stroke({ color: 'rgba(0,0,0,0.85)', width: 3 }),
                offsetY: -12 * globalScale,
            }),
        }));
        measureSource.addFeature(label);
    }
    updateMeasureReadout(total, pts, !!cursor);
}

function updateMeasureReadout(total, pts, hasPreview) {
    const el = document.getElementById('ui2_measure_text');
    if (!el) return;
    if (pts.length < 2) {
        el.textContent = measurePoints.length === 0
            ? 'Click the map to start measuring'
            : 'Click the next point · right-click to finish';
        return;
    }
    const a = pts[pts.length - 2], b = pts[pts.length - 1];
    let text = 'Total ' + format_distance_long(total, DisplayUnits);
    if (pts.length > 2) {
        text += ' · leg ' + format_distance_long(gcDistance(a, b), DisplayUnits);
    }
    text += ' · ' + gcBearing(a, b) + '°' + (hasPreview ? '' : ' · ' + measurePoints.length + ' points');
    if (measureFrozen) text += ' · finished';
    el.textContent = text;
}

function onMeasureClick(evt) {
    if (measureFrozen) return;
    measurePoints.push(ol.proj.toLonLat(evt.coordinate));
    redrawMeasure();
}
function onMeasureMove(evt) {
    if (measureFrozen || evt.dragging || measurePoints.length === 0) return;
    const now = Date.now();
    if (now - measureMoveGate < 40) return;
    measureMoveGate = now;
    redrawMeasure(ol.proj.toLonLat(evt.coordinate));
}
function onMapContextMenu(e) {
    e.preventDefault();
    if (newUI.measureActive) {
        if (measurePoints.length >= 2 && !measureFrozen) {
            measureFrozen = true;
            redrawMeasure();
        } else {
            toggleMeasure(false);
        }
        return;
    }
    closeCtxMenu();
    const f = planeAtPixel(OLMap.getEventPixel(e));
    if (f && f.hex) openCtxMenu(f, e);
}

let ctxOpen = false;

function planeAtPixel(pixel) {
    try {
        const src = (typeof webgl !== 'undefined' && webgl) ? webglFeatures : PlaneIconFeatures;
        const f = src.getClosestFeatureToCoordinate(OLMap.getCoordinateFromPixel(pixel));
        if (!f) return null;
        const fp = OLMap.getPixelFromCoordinate(f.getGeometry().getCoordinates());
        const tol = globalScale * ((typeof onMobile !== 'undefined' && onMobile) ? 30 : 20);
        if ((fp[0] - pixel[0]) ** 2 + (fp[1] - pixel[1]) ** 2 > tol * tol) return null;
        return f;
    } catch (err) { return null; }
}

function ctxItem(icon, label, fn) {
    const row = document.createElement('div');
    row.className = 'ui2-item';
    const ic = document.createElement('span');
    ic.className = 'ui2-icon';
    ic.innerHTML = icon;
    const lb = document.createElement('span');
    lb.className = 'ui2-item-label';
    lb.textContent = label;
    row.appendChild(ic);
    row.appendChild(lb);
    row.addEventListener('click', function() { closeCtxMenu(); fn(); });
    return row;
}

function openCtxMenu(feature, e) {
    const hex = feature.hex;
    const plane = (typeof g !== 'undefined' && g.planes) ? g.planes[hex] : null;
    const flight = plane && plane.flight ? String(plane.flight).trim() : '';
    const menu = document.createElement('div');
    menu.id = 'ui2_ctx';
    menu.className = 'ui2-menu ui2-show ui2-ctx';

    const title = document.createElement('div');
    title.className = 'ui2-ctx-title';
    title.textContent = (plane && (plane.registration || flight)) || hex.toUpperCase();
    menu.appendChild(title);

    menu.appendChild(ctxItem(I.star,
        isBookmarked(hex) ? 'Remove bookmark' : 'Bookmark',
        function() { if (plane) setBookmark(plane); }));
    menu.appendChild(ctxItem(I.follow, 'Follow',
        function() { selectPlaneByHex(hex, { follow: true }); }));
    menu.appendChild(ctxItem(I.isolate, 'Isolate',
        function() { selectPlaneByHex(hex, { follow: false }); toggleIsolation('on'); }));
    menu.appendChild(ctxItem(I.ruler, 'Measure from here', function() {
        const lonlat = ol.proj.toLonLat(feature.getGeometry().getCoordinates());
        toggleMeasure(true);
        measurePoints.push(lonlat);
        redrawMeasure();
    }));

    const host = document.getElementById('map_container');
    const rect = host.getBoundingClientRect();
    host.appendChild(menu);
    const mw = menu.offsetWidth, mh = menu.offsetHeight;
    let x = e.clientX - rect.left, y = e.clientY - rect.top;
    x = Math.min(x, rect.width - mw - 6);
    y = Math.min(y, rect.height - mh - 6);
    menu.style.left = Math.max(4, x) + 'px';
    menu.style.top = Math.max(4, y) + 'px';
    ctxOpen = true;
    document.body.classList.add('ui2-ctx-open');
    OLMap.once('pointerdrag', closeCtxMenu);
    if (!(typeof FollowSelected !== 'undefined' && FollowSelected)) {
        OLMap.once('movestart', closeCtxMenu);
    }
}
function closeCtxMenu() {
    const el = document.getElementById('ui2_ctx');
    if (el) el.remove();
    ctxOpen = false;
    document.body.classList.remove('ui2-ctx-open');
}

let ctrlForce = null;
function initCtrlMultiSelect() {
    OLMap.getViewport().addEventListener('pointerdown', function(e) {
        if (newUI.measureActive) return;
        if (e.button !== 0) return;
        if (!(e.ctrlKey || e.metaKey)) return;
        ctrlForce = { prev: multiSelect };
        multiSelect = true;
    }, true);

    window.addEventListener('pointerup', function() {
        if (!ctrlForce) return;
        const saved = ctrlForce;
        ctrlForce = null;

        setTimeout(function() { multiSelect = saved.prev; }, 0);
    }, true);
}

function applySortIndicator() {
    const table = document.getElementById('planesTable');
    if (!table || !TAR.planeMan) return;
    const head = table.querySelector('thead');
    if (!head) return;
    head.querySelectorAll('td').forEach(td => td.classList.remove('ui2-sort-asc', 'ui2-sort-desc'));
    const id = TAR.planeMan.sortId;
    if (!id) return;
    let cell = null;
    try { cell = head.querySelector('td#' + CSS.escape(id)); } catch (e) { cell = document.getElementById(id); }
    if (cell) cell.classList.add(TAR.planeMan.sortAscending ? 'ui2-sort-asc' : 'ui2-sort-desc');
}
function initTableSortIndicator() {
    const table = document.getElementById('planesTable');
    if (!table) return;

    new MutationObserver(applySortIndicator).observe(table, { childList: true });
    table.addEventListener('click', function(e) {
        if (e.target.closest && e.target.closest('thead')) setTimeout(applySortIndicator, 0);
    });
    applySortIndicator();
}

function toggleMeasure(force) {
    const on = (force != null) ? force : !newUI.measureActive;
    if (on === newUI.measureActive) return;
    newUI.measureActive = on;
    const item = registry.find(i => i.id === 'measure');
    if (item) { item._s = on; updateRow(item); }
    measureFrozen = false;
    if (on) {
        initMeasureLayer();
        measurePoints = [];
        redrawMeasure();
        OLMap.on('singleclick', onMeasureClick);
        OLMap.on('pointermove', onMeasureMove);
        document.body.classList.add('ui2-measuring');
        jQuery('#ui2_measure').addClass('ui2-show');
    } else {
        OLMap.un('singleclick', onMeasureClick);
        OLMap.un('pointermove', onMeasureMove);
        if (measureSource) measureSource.clear(true);
        document.body.classList.remove('ui2-measuring');
        jQuery('#ui2_measure').removeClass('ui2-show');
    }
}

function buildMeasureReadout() {
    const bar = jQuery(
        '<div id="ui2_measure" class="ui2-chrome">'
        + '<span class="ui2-icon">' + I.ruler + '</span>'
        + '<span id="ui2_measure_text"></span>'
        + '<button id="ui2_measure_undo" type="button" title="Remove last point">Undo</button>'
        + '<button id="ui2_measure_clear" type="button" title="Remove all points">Clear</button>'
        + '<button id="ui2_measure_done" type="button" title="Exit measuring (Esc)"><span class="ui2-icon">' + I.close + '</span></button>'
        + '</div>');
    jQuery('#map_container').append(bar);
    jQuery('#ui2_measure_undo').on('click', function() { measureFrozen = false; measurePoints.pop(); redrawMeasure(); });
    jQuery('#ui2_measure_clear').on('click', function() { measureFrozen = false; measurePoints = []; redrawMeasure(); });
    jQuery('#ui2_measure_done').on('click', function() { toggleMeasure(false); });
    OLMap.getViewport().addEventListener('contextmenu', onMapContextMenu);
}

const SETTINGS_SECTIONS = [
    { title: 'General',             special: 'general' },
    { title: 'Map appearance',      keys: ['darkMode', 'darkerColors', 'MapDim', 'ColoredPlanes', 'ColoredTrails', 'webgl'] },
    { title: 'Labels',              keys: ['showLabelUnits', 'windLabelsSlim', 'labelsGeom', 'utcTimesLive', 'utcTimesHistoric'] },
    { title: 'Altitude data',       keys: ['geomUseEGM', 'baroUseQNH'] },
    { title: 'Tracks & history',    keys: ['lastLeg', 'altitudeChart'] },
    { title: 'Aircraft info panel', keys: ['enableInfoblock', 'wideInfoblock', 'enableMouseover', 'autoselect', 'planespottersAPI', 'planespottingAPI', 'useRouteAPI'] },
    { title: 'Traffic shown',       special: 'traffic' },
    { title: 'Privacy & sharing',   keys: ['updateLocation', 'shareFilters'] },
    { title: 'Advanced',            keys: ['debugTracks', 'debugAll'], special: 'advanced' },
];

function buildModalShell() {
    jQuery(document.body).append(
        '<div id="ui2_modal_backdrop"></div>'
        + '<div id="ui2_modal" role="dialog" aria-label="Settings">'
        + '  <div id="ui2_modal_head">Settings'
        + '    <button id="ui2_modal_close" type="button" aria-label="Close"><span class="ui2-icon">' + I.close + '</span></button>'
        + '  </div>'
        + '  <div id="ui2_modal_body"></div>'
        + '</div>'
    );
    jQuery('#ui2_modal_close').on('click', closeModal);
    jQuery('#ui2_modal_backdrop').on('click', closeModal);
}

function populateModal() {
    if (modalBuilt) return;
    modalBuilt = true;
    const body = document.getElementById('ui2_modal_body');

    for (const sec of SETTINGS_SECTIONS) {
        const el = document.createElement('div');
        el.className = 'ui2-section';
        el.innerHTML = '<div class="ui2-section-title">' + sec.title + '</div>';

        if (sec.special === 'general') {
            for (const sliderId of ['userScaleSlider', 'iconScaleSlider']) {
                const slider = document.getElementById(sliderId);
                if (!slider) continue;
                const label = slider.previousElementSibling;
                if (label && label.classList.contains('settingsOptionContainer')) el.appendChild(label);
                el.appendChild(slider);
            }
            const units = document.getElementById('units_selector');
            if (units && units.closest('.settingsOptionContainer')) {
                el.appendChild(units.closest('.settingsOptionContainer'));
            }
        }

        if (sec.keys) {
            for (const key of sec.keys) {
                const cb = document.getElementById(key + '_cb');
                if (cb && cb.parentElement) el.appendChild(cb.parentElement);
            }
        }

        if (sec.special === 'traffic') {
            for (const id of ['groundvehicle_filter', 'blockedmlat_filter']) {
                const cb = document.getElementById(id);
                if (cb && cb.parentElement) el.appendChild(cb.parentElement);
            }
        }

        if (sec.special === 'advanced') {
            const reset = document.querySelector('#settings_infoblock button.formButton');
            if (reset && reset.closest('.settingsOptionContainer')) {
                el.appendChild(reset.closest('.settingsOptionContainer'));
            }
            const row = document.createElement('div');
            row.className = 'settingsOptionContainer';
            const btn = document.createElement('button');
            btn.className = 'formButton';
            btn.textContent = 'Switch to classic interface';
            btn.addEventListener('click', function() {
                loStore['ui2_optin'] = 'false';
                location.reload();
            });
            row.appendChild(btn);
            el.appendChild(row);
        }

        body.appendChild(el);
    }
}

function openModal() {
    closeMenus();
    closeSheet();
    populateModal();
    jQuery('#ui2_modal_backdrop').addClass('ui2-show');
    jQuery('#ui2_modal').addClass('ui2-show');
    modalOpen = true;
}
function closeModal() {
    jQuery('#ui2_modal_backdrop').removeClass('ui2-show');
    jQuery('#ui2_modal').removeClass('ui2-show');
    modalOpen = false;
}

function buildSheet() {
    jQuery(document.body).append(
        '<div id="ui2_sheet">'
        + '  <div id="ui2_sheet_head">Menu'
        + '    <button id="ui2_sheet_close" type="button" aria-label="Close"><span class="ui2-icon">' + I.close + '</span></button>'
        + '  </div>'
        + '  <div id="ui2_sheet_body"></div>'
        + '</div>'
    );
    jQuery('#ui2_sheet_close').on('click', closeSheet);
}

function openSheet() {
    const body = jQuery('#ui2_sheet_body');
    body.empty();
    for (const it of registry) { delete it._row_sheet; }

    const titles = { view: 'View', filters: 'Filters', tools: 'Tools' };
    for (const menuId of ['view', 'filters', 'tools']) {
        body.append('<div class="ui2-menu-title">' + titles[menuId] + '</div>');
        for (const it of registry) {
            if (it.menu !== menuId || it.sep) continue;
            if (it.showIf && !it.showIf()) continue;
            body.append(renderItem(it, 'sheet'));
        }
        if (menuId === 'filters') {
            const more = jQuery(
                '<div class="ui2-item"><span class="ui2-icon">' + I.funnel + '</span>'
                + '<span class="ui2-item-label">All filter options…</span>'
                + '<span class="ui2-icon">' + I.chevR + '</span></div>');
            more.on('click', function() { closeSheet(); openMenu('filters'); });
            body.append(more);
        }
    }

    body.append('<div class="ui2-menu-sep"></div>');
    const bmRow = jQuery(
        '<div class="ui2-item"><span class="ui2-icon">' + I.star + '</span>'
        + '<span class="ui2-item-label">Bookmarks</span><span class="ui2-icon">' + I.chevR + '</span></div>');
    bmRow.on('click', function() { closeSheet(); openMenu('bookmarks'); });
    body.append(bmRow);
    const settings = jQuery(
        '<div class="ui2-item"><span class="ui2-icon">' + I.gear + '</span>'
        + '<span class="ui2-item-label">Settings</span><span class="ui2-icon">' + I.chevR + '</span></div>');
    settings.on('click', function() { openModal(); });
    body.append(settings);

    jQuery('#ui2_sheet').addClass('ui2-show');
    sheetOpen = true;
    renderSheetStates();
}
function renderSheetStates() {
    for (const it of registry) updateRow(it);
}
function closeSheet() {
    jQuery('#ui2_sheet').removeClass('ui2-show');
    sheetOpen = false;
}

function restructureSidebar() {
    try { jQuery('#tabs').tabs('destroy'); } catch (e) {}
    try { delete loStore['active_tab']; } catch (e) {}

    jQuery('#tab-search-table').hide();

    const warning = document.getElementById('search_warning');
    const toast = document.getElementById('ui2_toast');
    if (warning && toast) toast.appendChild(warning);

    const sidebarTable = document.getElementById('sidebar-table');
    if (sidebarTable) {
        const head = jQuery(
            '<div id="ui2_sidebar_head">'
            + '<span class="ui2-sidebar-title">Aircraft</span>'
            + '</div>');
        jQuery(sidebarTable).prepend(head);
    }

    const columnsPane = document.getElementById('tab-columns');
    const planesTable = document.getElementById('planesTable');
    if (columnsPane && planesTable && planesTable.parentElement) {
        const disc = makeDisclosure('ui2_columns_disc', I.columns, 'Configure columns', 'ui2_columnsOpen');
        planesTable.parentElement.insertBefore(disc[0], planesTable);
        disc.find('.ui2-disclosure-body').append(columnsPane);
    }

    const rowKeys = ['moreTableLines1', 'moreTableLines2', 'allTableLines'];
    const rowEls = rowKeys.map(k => document.getElementById(k + '_cb'))
        .filter(Boolean).map(cb => cb.parentElement);
    if (rowEls.length && planesTable && planesTable.parentElement) {
        const disc = makeDisclosure('ui2_rows_disc', I.rows, 'Rows shown', 'ui2_rowsOpen');
        planesTable.parentElement.insertBefore(disc[0], planesTable);
        for (const el of rowEls) disc.find('.ui2-disclosure-body').append(el);
    }
}

function makeDisclosure(id, icon, label, storeKey) {
    const open = (loStore[storeKey] === 'true');
    const disc = jQuery(
        '<div class="ui2-disclosure' + (open ? ' ui2-open' : '') + '" id="' + id + '">'
        + '<button type="button" class="ui2-disclosure-head">'
        + '<span class="ui2-icon">' + I.chevR + '</span>'
        + '<span class="ui2-icon">' + icon + '</span>'
        + '<span>' + label + '</span>'
        + '</button>'
        + '<div class="ui2-disclosure-body"></div>'
        + '</div>');
    disc.find('.ui2-disclosure-head').on('click', function() {
        const nowOpen = disc.toggleClass('ui2-open').hasClass('ui2-open');
        try { loStore[storeKey] = nowOpen; } catch (e) {}
        this.blur();
    });
    return disc;
}

})();
