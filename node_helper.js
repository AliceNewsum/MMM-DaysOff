const NodeHelper = require("node_helper");
const https = require("https");
const http = require("http");

module.exports = NodeHelper.create({
    start: function() {
        console.log("MMM-DaysOff helper started");
    },

    socketNotificationReceived: function(notification, payload) {
        if (notification === "GET_DAYSOFF") {
            console.log("MMM-DaysOff fetching from:", payload.icalUrl);
            this.fetchCalendar(payload);
        }
    },

    fetchCalendar: function(config) {
        const url = config.icalUrl;
        if (!url) {
            console.log("MMM-DaysOff: No URL provided");
            return;
        }

        const client = url.startsWith("https") ? https : http;
        let data = "";

        client.get(url, (res) => {
            res.on("data", chunk => data += chunk);
            res.on("end", () => {
                const events = this.parseIcal(data, config);
                console.log("MMM-DaysOff found events:", events.length);
                this.sendSocketNotification("DAYSOFF_DATA", events);
            });
        }).on("error", (e) => {
            console.error("MMM-DaysOff fetch error:", e.message);
        });
    },

    parseIcal: function(data, config) {
        const now = new Date();
        const tags = config.tags || ["A", "M", "A&M"];
        const maxEvents = config.maxEvents || 10;
        const dateFormat = config.dateFormat || { month: "short", day: "numeric" };
        const events = [];
        const eventBlocks = data.split("BEGIN:VEVENT");

        // Build regex from configured tags, escaping special chars
        const escapedTags = tags.map(t => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
        const tagPattern = new RegExp("^\\[(" + escapedTags.join("|") + ")\\]");

        eventBlocks.slice(1).forEach(block => {
            const summaryMatch = block.match(/SUMMARY:(.+)/);
            const dateMatch = block.match(/DTSTART[;VALUE=DATE]*:(\d{8})/);
            if (!summaryMatch || !dateMatch) return;

            const summary = summaryMatch[1].trim();
            const dateStr = dateMatch[1];
            const date = new Date(
                parseInt(dateStr.substr(0, 4)),
                parseInt(dateStr.substr(4, 2)) - 1,
                parseInt(dateStr.substr(6, 2))
            );

            if (date < now) return;

            const tagMatch = summary.match(tagPattern);
            if (!tagMatch) return;

            const tag = "[" + tagMatch[1] + "]";
            const title = summary.replace(tag, "").trim();
            const dateFormatted = date.toLocaleDateString("en-US", dateFormat);

            events.push({ tag, title, date: dateFormatted, rawDate: date });
        });

        return events
            .sort((a, b) => a.rawDate - b.rawDate)
            .slice(0, maxEvents)
            .map(e => ({ tag: e.tag, title: e.title, date: e.date }));
    }
});
