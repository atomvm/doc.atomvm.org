/*
 * This file is part of AtomVM.
 *
 * Copyright 2026 Davide Bettio <davide@uninstall.it>
 *
 * SPDX-License-Identifier: Apache-2.0 OR LGPL-2.1-or-later
 */

/*
 * Replaces the "Versions" menu (lower left) with the versions listed in
 * /versions.json, so builds published earlier also list the newer versions.
 * Every build loads this script, see update_versions.py.
 */
(function () {
    "use strict";

    var indexRequest = fetch("/versions.json").then(function (response) {
        if (!response.ok) {
            throw new Error("Cannot load /versions.json: HTTP " + response.status);
        }
        return response.json();
    });

    var ready = new Promise(function (resolve) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", resolve);
        } else {
            resolve();
        }
    });

    function findVersionsList() {
        var lists = document.querySelectorAll(".rst-versions .rst-other-versions dl");
        for (var i = 0; i < lists.length; i++) {
            var title = lists[i].querySelector("dt");
            if (title && title.textContent.indexOf("Versions") !== -1) {
                return lists[i];
            }
        }
        return null;
    }

    function render(index) {
        var list = findVersionsList();
        if (!list) {
            return;
        }

        // The first path segment is the version, or an alias of it such as "latest"
        var aliases = index.aliases || {};
        var current = decodeURIComponent(window.location.pathname.split("/")[1] || "");
        current = aliases[current] || current;

        var title = list.querySelector("dt");
        while (title.nextSibling) {
            list.removeChild(title.nextSibling);
        }
        index.versions.forEach(function (version) {
            var item = document.createElement("dd");
            var link = document.createElement("a");
            link.href = version.url;
            if (version.name === current) {
                var strong = document.createElement("strong");
                strong.textContent = version.label;
                link.appendChild(strong);
            } else {
                link.textContent = version.label;
            }
            item.appendChild(link);
            // The entries are inline blocks: keep the whitespace between them
            list.appendChild(document.createTextNode("\n"));
            list.appendChild(item);
        });
    }

    Promise.all([indexRequest, ready])
        .then(function (results) {
            render(results[0]);
        })
        .catch(function (error) {
            // Keep the menu rendered when the build was made
            console.warn(error);
        });
})();
