"use strict";

// One-shot fetch of every active date for an ICAO. The Worker behind
// `globeDataBaseUrl` sets a daily-aligned `Cache-Control: max-age` so the
// browser's HTTP cache handles re-use across page loads — no client-side
// LRU/TTL bookkeeping needed.

// On fetch error nothing is cached — next selection of the same ICAO retries.
// Callers detect the errored state via `!hasFetched(icao)` and fall back to
// pre-AX-744 free-stepping nav (buttons + datepicker enabled, no day highlights).
var ActivityHistory = {
    datesByIcao: {},  // { icao: ["YYYY-MM-DD", ...] } — descending

    toDateStr: function(date) {
        if (typeof date === 'string') return date;
        return date.getUTCFullYear() + '-' +
            String(date.getUTCMonth() + 1).padStart(2, '0') + '-' +
            String(date.getUTCDate()).padStart(2, '0');
    },

    hasFetched: function(icao) {
        return Object.prototype.hasOwnProperty.call(this.datesByIcao, icao);
    },

    hasActivity: function(icao) {
        var dates = this.datesByIcao[icao];
        return !!(dates && dates.length > 0);
    },

    fetchActiveDates: async function(icao) {
        if (this.hasFetched(icao)) return this.datesByIcao[icao];
        try {
            var response = await fetch(globeDataBaseUrl + '/active-dates/' + icao);
            if (!response.ok) return [];
            var data = await response.json();
            var dates = data.dates || [];
            this.datesByIcao[icao] = dates;
            return dates;
        } catch (e) {
            return [];
        }
    },

    getNextDate: function(icao, currentDate) {
        var dates = this.datesByIcao[icao];
        if (!dates || !dates.length) return null;
        var current = this.toDateStr(currentDate);
        // Before the oldest known active date — free-step forward one day so
        // navigation stays day-by-day until it enters the active-dates range.
        if (current < dates[dates.length - 1]) {
            var d = new Date(current + 'T00:00:00Z');
            d.setUTCDate(d.getUTCDate() + 1);
            return this.toDateStr(d);
        }
        for (var i = dates.length - 1; i >= 0; i--) {
            if (dates[i] > current) return dates[i];
        }
        return null;
    },

    getPrevDate: function(icao, currentDate) {
        var dates = this.datesByIcao[icao];
        if (!dates || !dates.length) return null;
        var current = this.toDateStr(currentDate);
        for (var i = 0; i < dates.length; i++) {
            if (dates[i] < current) return dates[i];
        }
        // Past oldest known active date — free-step back one day until 2000-01-01
        // so users can navigate globe history that predates the active-dates dataset.
        if (current > '2000-01-01') {
            var d = new Date(current + 'T00:00:00Z');
            d.setUTCDate(d.getUTCDate() - 1);
            return this.toDateStr(d);
        }
        return null;
    },

    getActiveDatesSet: function(icao) {
        var dates = this.datesByIcao[icao];
        if (!dates) return {};
        var set = {};
        for (var i = 0; i < dates.length; i++) set[dates[i]] = true;
        return set;
    }
};
