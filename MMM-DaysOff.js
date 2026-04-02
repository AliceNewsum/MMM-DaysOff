Module.register("MMM-DaysOff", {
    defaults: {
        icalUrl: "",
        updateInterval: 60 * 60 * 1000,
        tags: ["A", "M", "A&M"],
        maxEvents: 10,
        header: "DAYS OFF",
        dateFormat: { month: "short", day: "numeric" }
    },

    getStyles: function() {
        return ["MMM-DaysOff.css"];
    },

    start: function() {
        this.events = [];
        this.getData();
        setInterval(() => this.getData(), this.config.updateInterval);
    },

    getData: function() {
        this.sendSocketNotification("GET_DAYSOFF", {
            icalUrl: this.config.icalUrl,
            tags: this.config.tags,
            maxEvents: this.config.maxEvents,
            dateFormat: this.config.dateFormat
        });
    },

    socketNotificationReceived: function(notification, payload) {
        if (notification === "DAYSOFF_DATA") {
            this.events = payload;
            this.updateDom();
        }
    },

    getDom: function() {
        const wrapper = document.createElement("div");
        wrapper.className = "daysoff-wrapper";

        if (this.events.length === 0) {
            const empty = document.createElement("div");
            empty.className = "daysoff-empty";
            empty.textContent = "No upcoming days off";
            wrapper.appendChild(empty);
            return wrapper;
        }

        const header = document.createElement("div");
        header.className = "daysoff-header";
        header.textContent = this.config.header;
        wrapper.appendChild(header);

        this.events.forEach(e => {
            const row = document.createElement("div");
            row.className = "daysoff-row";

            const tag = document.createElement("span");
            tag.className = "daysoff-tag";
            tag.textContent = e.tag;

            const text = document.createTextNode(" " + e.title + " - " + e.date);

            row.appendChild(tag);
            row.appendChild(text);
            wrapper.appendChild(row);
        });

        return wrapper;
    }
});
