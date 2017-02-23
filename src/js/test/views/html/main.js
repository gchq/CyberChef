/**
 * main.js
 *
 * Simple VueJS app for running all the tests and displaying some basic stats.
 * @author tlwr [toby@toby.codes]
 * @copyright Crown Copyright 2017
 * @license Apache-2.0
 *
 */
(function() {
    Vue.component("test-status-icon", {
        template: "#test-status-icon-template",
        props: ["status"],

        methods: {
            getIcon: function() {
                var icons = {
                    waiting: "⌚",
                    loading: "⚡",
                    passing: "✔️️",
                    failing: "❌",
                    erroring: "☠️",
                };

                return icons[this.status];
            }
        },
    });

    Vue.component("test-stats", {
        template: "#test-stats-template",
        props: ["tests"],

        methods: {
            countTestsWithStatus: function(status) {
                return this.tests.filter(function(test) {
                    return test.status === status;
                }).length;
            },
        },
    });

    Vue.component("tests", {
        template: "#tests-template",
        props: ["tests"],
    });

    window.TestRunner = new Vue({
        el: "main",
        data: {
            tests: TestRegister.getTests(),
        },

        mounted: function() {
            TestRegister.runTests();
        },
    });
})();
