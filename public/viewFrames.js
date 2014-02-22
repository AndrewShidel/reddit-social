var view = {

    create: function(setup) {
        view.setup = setup;
        var readyStateCheckInterval = setInterval(function() {
            if (document.readyState === "complete") {
                clearInterval(readyStateCheckInterval);
                var hashValue = view.getHash(),
                    handles = document.querySelectorAll('.handle'),
                    i;
                view.flag = false;
                if (hashValue === '') {
                    view.update(setup.index.name, true);
                } else {
                    view.update(view.getHash(), false);
                }
                for (i = 0; i < handles.length; i += 1) {
                    if (handles[i].addEventListener) {
                        handles[i].addEventListener('click', view.trigger)
                    } else if (handles[i].attachEvent) {
                        handles[i].attachEvent('onclick', view.trigger);
                    }
                }

                window.onhashchange = function() {
                    if (view.flag) {
                        view.update(view.getHash(), false);
                    } else {
                        view.flag = true;
                    }
                };
            }
        }, 10);
    },

    update: function(hashValue, bool) {
        var temp = document.createElement("IFRAME"),
            frame = document.getElementById(view.setup.view),
            parent = frame.parentNode;
        if (view.setup.exceptions[hashValue]) {
            temp.src = view.setup.exceptions[hashValue];
        } else {
            temp.src = view.setup.path + '/' + hashValue + '.html' || view.setup.index.location
        }
        var src = temp.src;
        temp.id = view.setup.view;

        temp.frameBorder = "no";



        parent.replaceChild(temp, frame);

        if (view.setup.autoSize == true) {
            temp.contentWindow.addEventListener('resize', function(event) {
                view.sizeFrame(view.setup.view);
            });
        }

        if (temp.addEventListener) {
            temp.addEventListener("load", function() {
                view.sizeFrame(view.setup.view);
                var cur_url = temp.contentWindow.location.href;
                if (cur_url != src) {
                    view.flag = false;
                    view.setHash(cur_url.match(/([^\/]+)(?=\.\w+$)/)[0]);
                }

            });
        } else if (temp.attachEvent) {
            temp.attachEvent("onload", function() {
                view.sizeFrame(view.setup.view)
                var cur_url = temp.contentWindow.location.href;
                if (cur_url!= src) {
                    view.flag = false;
                    view.setHash(cur_url.match(/([^\/]+)(?=\.\w+$)/)[0]);
                }
            });
        }



        if (bool) {
            view.setHash(hashValue);
        }
    },

    trigger: function(event) {
        if (!event) {
            event = window.event;
        }

        var caller = event.target || event.srcElement,
            link = caller.getAttribute('data-link');

        view.update(link, true);
    },

    getHash: function() {
        return window.location.hash.substring(1);
    },

    setHash: function(str) {
        view.flag = false;
        window.location.hash = str;
    },

    sizeFrame: function(elem) {

        var el = document.getElementById(elem);
        el.height = (el.contentWindow.document.body.scrollHeight) + "px";
    }
};