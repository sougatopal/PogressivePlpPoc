(function(a) {
    a.fn.extend({
        autocomplete: function(b, c) {
            var e = typeof b == "string";
            c = a.extend({}, a.Autocompleter.defaults, {
                url: e ? b : null,
                data: e ? null : b,
                delays: e ? a.Autocompleter.defaults.delays : 10,
                max: c && !c.scroll ? 10 : 150
            }, c);
            c.highlight = c.highlight || function(d) {
                return d
            };
            c.formatMatch = c.formatMatch || c.formatItem;
            return this.each(function() {
                new a.Autocompleter(this, c)
            })
        },
        result: function(b) {
            return this.bind("result", b)
        },
        search: function(b) {
            return this.trigger("search", [b])
        },
        flushCache: function() {
            return this.trigger("flushCache")
        },
        setOptions: function(b) {
            return this.trigger("setOptions", [b])
        },
        unautocomplete: function() {
            return this.trigger("unautocomplete")
        }
    });
    a.Autocompleter = function(b, c) {
        function e() {
            var v = r.selected();
            if (!v) return false;
            var y = v.result;
            k = y;
            if (c.multiple) {
                var A = l(f.val());
                if (A.length > 1) {
                    var D = c.multipleSeparator.length,
                        G = a(b).selection().start,
                        H, C = 0;
                    a.each(A, function(B, E) {
                        C += E.length;
                        if (G <= C) {
                            H = B;
                            return false
                        }
                        C += D
                    });
                    A[H] = y;
                    y = A.join(c.multipleSeparator)
                }
                y += c.multipleSeparator
            }
            f.val(y);
            t();
            f.trigger("result", [v.data,
                v.value
            ]);
            return true
        }

        function d(v, y) {
            if (x == h.DEL) r.hide();
            else {
                var A = f.val();
                if (!(!y && A == k)) {
                    k = A;
                    A = n(A);
                    if (A.length >= c.minChars) {
                        f.addClass(c.loadingClass);
                        c.matchCase || (A = A.toLowerCase());
                        m(A, o, t)
                    } else {
                        f.removeClass(c.loadingClass);
                        r.hide()
                    }
                }
            }
        }

        function l(v) {
            if (!v) return [""];
            if (!c.multiple) return [a.trim(v)];
            return a.map(v.split(c.multipleSeparator), function(y) {
                return a.trim(v).length ? a.trim(y) : null
            })
        }

        function n(v) {
            if (!c.multiple) return v;
            var y = l(v);
            if (y.length == 1) return y[0];
            y = a(b).selection().start;
            y = y == v.length ? l(v) : l(v.replace(v.substring(y), ""));
            return y[y.length - 1]
        }

        function t() {
            r.visible();
            r.hide();
            clearTimeout(g);
            f.removeClass(c.loadingClass);
            c.mustMatch && f.search(function(v) {
                if (!v)
                    if (c.multiple) {
                        v = l(f.val()).slice(0, -1);
                        f.val(v.join(c.multipleSeparator) + (v.length ? c.multipleSeparator : ""))
                    } else {
                        f.val("");
                        f.trigger("result", null)
                    }
            })
        }

        function o(v, y) {
            if (y && y.length && w) {
                f.removeClass(c.loadingClass);
                r.display(y, v);
                var A = y[0].value;
                if (c.autoFill && n(f.val()).toLowerCase() == v.toLowerCase() && x !=
                    h.BACKSPACE) {
                    f.val(f.val() + A.substring(n(k).length));
                    a(b).selection(k.length, k.length + A.length)
                }
                r.show()
            } else t()
        }

        function m(v, y, A) {
            c.matchCase || (v = v.toLowerCase());
            var D = q.load(v),
                G = Target.globals.enableTypeAheadService == true || Target.globals.enableTypeAheadService == "true" ? true : false;
            if (D && D.length) y(v, D);
            else if (typeof c.url == "string" && c.url.length > 0) {
                var H = {
                    ctgryVal: a("#category").val()
                };
                a.each(c.extraParams, function(C, B) {
                    H[C] = typeof B == "function" ? B() : B
                });
                a.ajax({
                    mode: "abort",
                    port: "autocomplete" +
                        b.name,
                    dataType: G ? "jsonp" : c.dataType,
                    url: c.url,
                    jsonpCallback: "TypeAheadService",
                    curtain: false,
                    data: a.extend({
                        q: n(v),
                        maxRecommendations: 10,
                        maxCategories: 2
                    }, H),
                    success: function(C) {
                        if (jQuery.inArray(z, C) != -1) return false;
                        var B;
                        if (G) {
                            var E;
                            if (!(E = c.parseTypeAheadService && c.parseTypeAheadService(C))) {
                                C = eval(C);
                                E = [];
                                for (B in C) {
                                    C[B].location = "//" + Target.globals.hostName + C[B].location;
                                    var F = [C[B].label, null, C[B].location, C[B].subResults];
                                    E[E.length] = {
                                        data: F,
                                        value: F[0],
                                        result: c.formatResult && c.formatResult(F,
                                            F[0]) || F[0]
                                    }
                                }
                                E = E
                            }
                            B = E
                        } else {
                            if (!(B = c.parse && c.parse(C))) {
                                B = [];
                                C = C.split("\n");
                                for (E = 0; E < C.length; E++)
                                    if (F = a.trim(C[E])) {
                                        F = F.split("@^");
                                        B[B.length] = {
                                            data: F,
                                            value: F[0],
                                            result: c.formatResult && c.formatResult(F, F[0]) || F[0]
                                        }
                                    }
                                B = B
                            }
                            B = B
                        }
                        B = B;
                        q.add(v, B);
                        y(v, B)
                    },
                    xhr: function() {
                        return a.browser.msie && parseInt(a.browser.version) <= 7 ? new ActiveXObject("Microsoft.XMLHTTP") : new XMLHttpRequest
                    }
                })
            } else {
                r.emptyList();
                A(v)
            }
        }
        var h = {
                UP: 38,
                DOWN: 40,
                DEL: 46,
                TAB: 9,
                RETURN: 13,
                ESC: 27,
                COMMA: 188,
                PAGEUP: 33,
                PAGEDOWN: 34,
                BACKSPACE: 8
            },
            f =
            a(b).attr("autocomplete", "off").addClass(c.inputClass),
            g, k = "",
            q = a.Autocompleter.Cache(c),
            w = 0,
            x, z = "Prohibited characters error",
            p = {
                mouseDownOnSelect: false
            },
            r = a.Autocompleter.Select(c, b, e, p),
            u;
        a.browser.opera && a(b.form).bind("submit.autocomplete", function() {
            if (u) return u = false
        });
        a("form#Search").submit(function() {
            a(this).find("#lnk").val("snav_sbox_" + a("#searchTerm").val())
        });
        f.bind((a.browser.opera ? "keypress" : "keydown") + ".autocomplete", function(v) {
            w = 1;
            x = v.keyCode;
            switch (v.keyCode) {
                case h.UP:
                    v.preventDefault();
                    a(".ac_results").find(".ac_hover").removeClass("ac_hover");
                    r.visible() ? r.prev() : d(0, true);
                    break;
                case h.DOWN:
                    v.preventDefault();
                    a(".ac_results").find(".ac_hover").removeClass("ac_hover");
                    r.visible() ? r.next() : d(0, true);
                    break;
                case h.PAGEUP:
                    v.preventDefault();
                    r.visible() ? r.pageUp() : d(0, true);
                    break;
                case h.PAGEDOWN:
                    v.preventDefault();
                    r.visible() ? r.pageDown() : d(0, true);
                    break;
                case c.multiple && a.trim(c.multipleSeparator) == "," && h.COMMA:
                case h.TAB:
                case h.RETURN:
                    try {
                        var y = a(".ac_results").find("li ul .ac_over");
                        if (y.length == 1) {
                            v.preventDefault();
                            window.location = y.attr("rel");
                            return false
                        }
                    } catch (A) {}
                    if (e()) {
                        v.preventDefault();
                        u = true;
                        return false
                    }
                    break;
                case h.ESC:
                    r.hide();
                    break;
                default:
                    clearTimeout(g);
                    g = setTimeout(d, c.delays)
            }
        }).focus(function() {
            w++
        }).blur(function() {
            w = 0;
            if (!p.mouseDownOnSelect) {
                clearTimeout(g);
                g = setTimeout(t, 200)
            }
        }).click(function() {
            w++ > 1 && !r.visible() && d(0, true)
        }).bind("search", function() {
            function v(A, D) {
                var G;
                if (D && D.length)
                    for (var H = 0; H < D.length; H++)
                        if (D[H].result.toLowerCase() == A.toLowerCase()) {
                            G =
                                D[H];
                            break
                        }
                typeof y == "function" ? y(G) : f.trigger("result", G && [G.data, G.value])
            }
            var y = arguments.length > 1 ? arguments[1] : null;
            a.each(l(f.val()), function(A, D) {
                m(D, v, v)
            })
        }).bind("flushCache", function() {
            q.flush()
        }).bind("setOptions", function(v, y) {
            a.extend(c, y);
            "data" in y && q.populate()
        }).bind("unautocomplete", function() {
            r.unbind();
            f.unbind();
            a(b.form).unbind(".autocomplete")
        })
    };
    a.Autocompleter.defaults = {
        inputClass: "ac_input",
        resultsClass: "ac_results",
        loadingClass: "ac_loading",
        minChars: 1,
        delays: 150,
        matchCase: false,
        matchSubset: true,
        matchContains: false,
        cacheLength: 10,
        max: 100,
        mustMatch: false,
        extraParams: {},
        selectFirst: false,
        formatItem: function(b) {
            return b[0]
        },
        formatMatch: null,
        autoFill: false,
        width: 0,
        multiple: false,
        multipleSeparator: ", ",
        highlight: function(b, c) {
            c = c.replace(/^\s+|\s+$/g, "");
            var e = RegExp("^" + c.replace(/([\^\$\(\)\[\]\{\}\*\.\+\?\|\\])/gi, "\\$1") + "", "g"),
                d = RegExp("\\s+" + c.replace(/([\^\$\(\)\[\]\{\}\*\.\+\?\|\\])/gi, "\\$1") + "", "g");
            return b.replace(e, "<strong>" + c + "</strong>").replace(d, " <strong>" +
                c + "</strong>")
        },
        scroll: true,
        scrollHeight: 180
    };
    a.Autocompleter.Cache = function(b) {
        function c(o, m) {
            b.matchCase || (o = o.toLowerCase());
            var h = o.indexOf(m);
            if (b.matchContains == "word") h = o.toLowerCase().search("\\b" + m.toLowerCase());
            if (h == -1) return false;
            return h == 0 || b.matchContains
        }

        function e(o, m) {
            t > b.cacheLength && l();
            n[o] || t++;
            n[o] = m
        }

        function d() {
            if (!b.data) return false;
            var o = {},
                m = 0;
            if (!b.url) b.cacheLength = 1;
            o[""] = [];
            for (var h = 0, f = b.data.length; h < f; h++) {
                var g = b.data[h];
                g = typeof g == "string" ? [g] : g;
                var k = b.formatMatch(g,
                    h + 1, b.data.length);
                if (k !== false) {
                    var q = k.charAt(0).toLowerCase();
                    o[q] || (o[q] = []);
                    g = {
                        value: k,
                        data: g,
                        result: b.formatResult && b.formatResult(g) || k
                    };
                    o[q].push(g);
                    m++ < b.max && o[""].push(g)
                }
            }
            a.each(o, function(w, x) {
                b.cacheLength++;
                e(w, x)
            })
        }

        function l() {
            n = {};
            t = 0
        }
        var n = {},
            t = 0;
        setTimeout(d, 25);
        return {
            flush: l,
            add: e,
            populate: d,
            load: function(o) {
                if (!b.cacheLength || !t) return null;
                if (!b.url && b.matchContains) {
                    var m = [],
                        h;
                    for (h in n)
                        if (h.length > 0) {
                            var f = n[h];
                            a.each(f, function(g, k) {
                                c(k.value, o) && m.push(k)
                            })
                        }
                    return m
                } else if (n[o]) return n[o];
                else if (b.matchSubset)
                    for (h = o.length - 1; h >= b.minChars; h--)
                        if (f = n[o.substr(0, h)]) {
                            m = [];
                            a.each(f, function(g, k) {
                                if (c(k.value, o)) m[m.length] = k
                            });
                            return m
                        }
                return null
            }
        }
    };
    a.Autocompleter.Select = function(b, c, e, d) {
        function l() {
            if (w) {
                x = a("<div/>").hide().addClass(b.resultsClass).css({
                    position: "absolute",
                    "font-weight": "normal"
                }).insertAfter(".ac_input");
                a.browser.msie && a("<span class='screen-reader-only' role='status' aria-live='polite'>Suggestions are available, use arrow keys to navigate and press enter to make a selection.</span>").appendTo(x);
                z = a("<ul/>").appendTo(x).mouseover(function(p) {
                    if (n(p).nodeName && n(p).nodeName.toUpperCase() == "LI") {
                        g = a("li", z).removeClass(h.HOVER).index(n(p));
                        z.find(".ac_over").removeClass("ac_over");
                        a(n(p)).addClass(h.HOVER)
                    }
                }).click(function(p) {
                    a(n(p)).addClass(h.ACTIVE);
                    e();
                    return false
                }).mousedown(function() {
                    d.mouseDownOnSelect = true
                }).mouseup(function() {
                    d.mouseDownOnSelect = false
                });
                b.width > 0 && x.css("width", b.width);
                w = false
            }
        }

        function n(p) {
            for (p = p.target; p && p.tagName != "LI";) p = p.parentNode;
            if (!p) return [];
            return p
        }

        function t(p) {
            f.slice(g, g + 1).removeClass(h.ACTIVE);
            var r = f.slice(g, g + 1);
            r.parent().parent("li").removeClass(h.ACTIVE);
            g += p;
            if (g < 0) g = f.size() - 1;
            else if (g >= f.size()) g = 0;
            r = f.slice(g, g + 1).addClass(h.ACTIVE);
            a(c).attr("aria-label", a(r).text());
            if (b.scroll) {
                var u = 0;
                f.slice(0, g).each(function() {
                    u += this.offsetHeight
                });
                if (u + r[0].offsetHeight - z.scrollTop() > z[0].clientHeight) z.scrollTop(u + r[0].offsetHeight - z.innerHeight());
                else u < z.scrollTop() && z.scrollTop(u)
            }
        }

        function o(p) {
            var r = {
                "&": "&amp;",
                '"': "&quot;",
                "'": "&#39;",
                "#": "&#035;",
                $: "&#36;",
                "%": "&#37;",
                "@": "&#64;",
                "^": "&#94;",
                "-": "&#45;",
                _: "&#95;",
                "+": "&#43;"
            };
            return p.replace(/[<&>"#]|<&>'"#/g, function(u) {
                return r[u]
            })
        }

        function m(p) {
            var r = a("<ul/>"),
                u;
            for (u in p) typeof Target.globals.thirdParty == "undefined" || Target.globals.thirdParty == false ? a('<li class="subli"/>').html(p[u].subLabel).attr("rel", p[u].subLocation).appendTo(r) : a('<li class="subli"/>').html(p[u].subLabel).attr("rel", "http://www.target.com" + p[u].subLocation).appendTo(r);
            r.delegate("li", "click", function() {
                window.location.href =
                    a(this).attr("rel")
            });
            return r
        }
        var h = {
                ACTIVE: "ac_over",
                HOVER: "ac_hover"
            },
            f, g = -1,
            k, q = "",
            w = true,
            x, z;
        return {
            display: function(p, r) {
                l();
                k = p;
                q = r;
                z.empty();
                for (var u = b.max && b.max < k.length ? b.max : k.length, v = 0; v < u; v++)
                    if (k[v]) {
                        var y = k[v].data,
                            A = b.formatItem(y, v + 1, u, k[v].value, q);
                        if (A !== false) {
                            A = a("<li/>").html("<span>" + b.highlight(A, o(q)) + "</span>").addClass(v % 2 == 0 ? "ac_even" : "ac_odd").appendTo(z)[0];
                            typeof y[3] != "undefined" && m(y[3]).appendTo(A);
                            a.data(A, "ac_data", k[v])
                        }
                    }
                f = z.find("li");
                if (b.selectFirst) {
                    f.slice(0,
                        1).addClass(h.ACTIVE);
                    g = 0
                }
                a.fn.bgiframe && z.bgiframe();
                if (a.browser.mozilla) {
                    u = a("#searchTerm").attr("aria-label");
                    u = typeof u == "undefined" ? "Suggestions are available, use arrow keys to navigate and press enter to make a selection" : u;
                    u = u.indexOf(".") != -1 ? u = u.replace(".", "") : u += ".";
                    a("#searchTerm").attr("aria-label", u)
                }
            },
            next: function() {
                t(1)
            },
            prev: function() {
                t(-1)
            },
            pageUp: function() {
                g != 0 && g - 8 < 0 ? t(-g) : t(-8)
            },
            pageDown: function() {
                g != f.size() - 1 && g + 8 > f.size() ? t(f.size() - 1 - g) : t(8)
            },
            hide: function() {
                x && x.hide();
                f && f.removeClass(h.ACTIVE);
                g = -1
            },
            visible: function() {
                return x && x.is(":visible")
            },
            current: function() {
                return this.visible() && (f.filter("." + h.ACTIVE)[0] || b.selectFirst && f[0])
            },
            show: function() {
                a(c).offset();
                if (Target.globals.verticalNav) typeof Target.support.ie !== "undefined" && Target.support.ie <= 8 ? x.css({
                    width: typeof b.width == "string" || b.width > 0 ? b.width : a(c).width() + 9,
                    top: c.offsetHeight + 16,
                    left: c.offsetLeft - 5
                }).show() : x.css({
                    width: typeof b.width == "string" || b.width > 0 ? b.width : a(c).width() + 7,
                    top: c.offsetHeight +
                        16,
                    left: c.offsetLeft - 5
                }).show();
                else typeof Target.support.ie !== "undefined" && Target.support.ie <= 8 ? x.css({
                    width: typeof b.width == "string" || b.width > 0 ? b.width : a(c).width() + 16,
                    top: c.offsetHeight + 16,
                    left: c.offsetLeft - 5
                }).show() : x.css({
                    width: typeof b.width == "string" || b.width > 0 ? b.width : a(c).width() + 7,
                    top: c.offsetHeight + 16,
                    left: c.offsetLeft - 5
                }).show();
                if (b.scroll) {
                    z.scrollTop(0);
                    z.css({
                        maxHeight: b.scrollHeight,
                        overflow: "auto"
                    });
                    if (a.browser.msie && typeof document.body.style.maxHeight === "undefined") {
                        var p = 0;
                        f.each(function() {
                            p += this.offsetHeight
                        });
                        var r = p > b.scrollHeight;
                        z.css("height", r ? b.scrollHeight : p);
                        r || f.width(z.width() - parseInt(f.css("padding-left")) - parseInt(f.css("padding-right")))
                    }
                }
            },
            selected: function() {
                var p = f && f.filter("." + h.ACTIVE).removeClass(h.ACTIVE);
                return p && p.length && a.data(p[0], "ac_data")
            },
            emptyList: function() {
                z && z.empty()
            },
            unbind: function() {
                x && x.remove()
            }
        }
    };
    a.fn.selection = function(b, c) {
        if (b !== undefined) return this.each(function() {
            if (this.createTextRange) {
                var t = this.createTextRange();
                if (c === undefined || b == c) t.move("character", b);
                else {
                    t.collapse(true);
                    t.moveStart("character", b);
                    t.moveEnd("character", c)
                }
                t.select()
            } else if (this.setSelectionRange) this.setSelectionRange(b, c);
            else if (this.selectionStart) {
                this.selectionStart = b;
                this.selectionEnd = c
            }
        });
        var e = this[0];
        if (e.createTextRange) {
            var d = document.selection.createRange(),
                l = e.value,
                n = d.text.length;
            d.text = "<->";
            d = e.value.indexOf("<->");
            e.value = l;
            this.selection(d, d + n);
            return {
                start: d,
                end: d + n
            }
        } else if (e.selectionStart !== undefined) return {
            start: e.selectionStart,
            end: e.selectionEnd
        }
    }
})(jQuery);
Target.register("controller", "miniCart", {
    maxItems: 4,
    delayEnter: 500,
    delayLeave: 500,
    cartCount: ".count",
    cartText: ".your-cart",
    itemsWrap: ".items-set",
    summaryWrap: ".summary",
    cartIcon: "#mini-cart-icon",
    cartWrapper: "#mini-cart-wrapper",
    cartArrow: ".mini-cart-arrow",
    cartContainer: "#mini-cart",
    cartClose: ".minicart-close",
    markup: '<div id="mini-cart"><span class="blocker"></span><div class="summary"></div><div class="items-set"></div></div>',
    _miniCart: null,
    _cartInit: false,
    _cartInitWidth: null,
    _cartArrowWidth: null,
    init: function() {
        this.loadInterface();
        this.helpers()
    },
    loadInterface: function() {
        var a = this,
            b, c;
        a.cartWrapperId = a.cartWrapper;
        a.cartWrapper = $(a.cartWrapper);
        a.markup = $(a.markup);
        a.cartIcon = $(a.cartIcon);
        if (Target.globals.verticalNav) a.cartText = $(a.cartText);
        a.cartCount = a.cartIcon.find(a.cartCount);
        this.update();
        if (typeof s != "undefined" && typeof s.pageName != "undefined") var e = s.pageName;
        if ("ontouchstart" in window || window.DocumentTouch && document instanceof DocumentTouch ? true : false) $("body").delegate("#mini-cart-icon, .minicart-close",
            "click touchstart",
            function(l) {
                l.preventDefault();
                l = $("#mini-cart").css("display");
                if (l == "none") {
                    clearTimeout(c);
                    b = setTimeout(function() {
                        a._cartInit || a.show()
                    }, a.delayEnter)
                } else if (l == "block") {
                    clearTimeout(b);
                    c = setTimeout(function() {
                        a._cartInit && a.hide()
                    }, a.delayLeave);
                    if (typeof e != "undefined") try {
                        s.pageName = e
                    } catch (n) {}
                }
            });
        else {
            var d = {
                hideMinicart: function() {
                    clearTimeout(b);
                    c = setTimeout(function() {
                        a._cartInit && a.hide()
                    }, a.delayLeave);
                    if (typeof e != "undefined") s.pageName = e
                },
                showMinicart: function() {
                    clearTimeout(c);
                    b = setTimeout(function() {
                        a._cartInit || a.show(function() {
                            $(".itemCountFSet", a.cartContainer).attr("tabindex", "-1").focus()
                        })
                    }, a.delayEnter)
                }
            };
            $("body").delegate(a.cartWrapperId, "mouseenter mouseleave", function(l) {
                if (l.type == "mouseover" || l.type == "mouseenter") {
                    d.showMinicart();
                    $("#Header .mini-cart-arrow").text("minicart collapse")
                } else {
                    d.hideMinicart();
                    $("#Header .mini-cart-arrow").text("minicart expand")
                }
            });
            $("body").delegate(a.cartClose, "keyup", function(l) {
                l.preventDefault();
                $(this);
                var n = $(l.currentTarget).hasClass("minicart-close");
                l = l.which || l.keyCode;
                if (l == 13 && n || l == 27) {
                    d.hideMinicart();
                    $("#Header .mini-cart-arrow").text("minicart expand");
                    $(a.cartArrow).focus()
                }
            });
            $("body").delegate(a.cartContainer + ":not(.minicart-close)", "keyup", function(l) {
                l.preventDefault();
                if ((l.which || l.keyCode) == 27) {
                    d.hideMinicart();
                    $("#Header .mini-cart-arrow").text("minicart expand");
                    $(a.cartArrow).focus()
                }
            });
            $("body").delegate(a.cartArrow + "," + a.cartClose, "click", function(l) {
                l.preventDefault();
                if ($(this).hasClass("mini-cart-arrow")) {
                    d.showMinicart();
                    $("#Header .mini-cart-arrow").text("minicart collapse")
                } else {
                    d.hideMinicart();
                    $(a.cartArrow).focus();
                    $("#Header .mini-cart-arrow").text("minicart expand")
                }
            })
        }
        if (!a._miniCart && a.cartWrapper.length) {
            a.cartWrapper.append(a.markup);
            a._miniCart = a.markup;
            a._cartInitWidth = a._miniCart.width();
            a.itemsWrap = a._miniCart.find(a.itemsWrap);
            a.summaryWrap = a._miniCart.find(a.summaryWrap)
        }
        $("#Country").val();
        $.validator.addMethod("validInternationalPhoneNumber", function(l) {
            return l.match(/^\d{1,20}$/)
        });
        $("#Country").bind("change",
            function() {
                $("#Country").val();
                $("#Country").val()
            })
    },
    show: function(a) {
        var b = this,
            c;
        if (typeof a === "undefined") a = function() {};
        b._cartInit = true;
        b._miniCart.addClass("loading");
        b._miniCart.slideDown(500);
        b.getContent(function(e) {
            b.summaryWrap.html(e.summary);
            b._miniCart.removeClass("loading");
            if (e.items !== "" && e.items !== null) {
                c = b.processItems(e.items);
                b._cartArrowWidth = b._miniCart.find(".nextFrame").width() * 2;
                b._miniCart.addClass("populated");
                setTimeout(function() {
                    b._cartInitWidth = b._miniCart.width();
                    var d = c.width + b._cartInitWidth + b._cartArrowWidth;
                    if ($(".grmHeader").length > 0) d = c.width + b._cartInitWidth + b._cartArrowWidth + 20;
                    b._miniCart.stop(true, true).animate({
                        width: d
                    }, {
                        queue: true,
                        duration: 500
                    })
                }, 1E3);
                b._miniCart.find("ul.items li:last").addClass("no-separator");
                $("div#mini-cart").css({
                    height: "auto"
                })
            } else {
                e = 93;
                b._miniCart.find(".summary, .blocker").animate({
                    height: e
                }, {
                    queue: true,
                    duration: 300
                });
                e = 150;
                b._miniCart.stop().animate({
                    height: e
                }, {
                    queue: true,
                    duration: 300
                });
                $.miniCart.update("0|0");
                Cart.createQtyCookie("0|0")
            }
            a(true)
        })
    },
    hide: function() {
        var a = this;
        a._cartInit = false;
        a._miniCart.animate({
            width: a._cartInitWidth
        }, {
            queue: true,
            duration: 500,
            complete: function() {
                a._miniCart.slideUp(500, function() {
                    a.itemsWrap.empty();
                    a.summaryWrap.empty();
                    a._miniCart.removeClass("loading populated");
                    a._miniCart.find(".summary, .blocker").removeAttr("style")
                })
            }
        })
    },
    processItems: function(a) {
        a = $(a);
        var b = a.find(">li"),
            c;
        if (b) {
            this.itemsWrap.html(a);
            if (b.length > this.maxItems) {
                this._miniCart.addClass("overflow");
                this.itemsWrap.find("ul:eq(0)").tileCarousel({
                    speed: 200,
                    pagination: false,
                    incrementMode: "frame",
                    increment: this.maxItems,
                    viewportDelta: -1
                });
                c = this.itemsWrap.find(".carousel-container").width()
            } else {
                c = b.eq(0).outerWidth(true) * b.length;
                this.itemsWrap.width(c)
            }
        }
        return {
            items: b,
            width: c
        }
    },
    getContent: function(a) {
        var b = this.cartWrapper.attr("ajaxsrc");
        $.ajax({
            url: Target.controller.headerNew.getProtocol(b),
            type: "GET",
            cache: false,
            curtain: false,
            dataType: "jsonp",
            jsonp: "jsonp",
            success: function(c) {
                a(c)
            },
            error: function() {
                console.log("Request failed")
            }
        })
    },
    helpers: function() {
        $.miniCart =
            this;
        $.miniCart.update = this.update
    },
    update: function(a) {
        var b;
        if (typeof a === "string") {
            b = a;
            itemVal = a.split("|");
            a = parseInt(itemVal[0]);
            switch (b) {
                case "add":
                    a++;
                    break;
                case "remove":
                    a != 0 && a--;
                    break;
                case "empty":
                    a = 0;
                    break;
                case "null":
                    a = 0;
                    break;
                case "":
                    a = 0
            }
        }
        if (Target.globals.verticalNav) {
            if (typeof a !== "undefined" && a != 0) {
                typeof this.cartText.text !== "undefined" ? this.cartText.text(" in your cart") : $("#mini-cart-icon .your-cart").text(" in your cart");
                if (a < 10) {
                    b = "14px";
                    if ($(".grmHeader").length > 0) {
                        b = "24px";
                        $(".bootFix #Header #ShopMenu #mini-cart-icon .count").css("min-width", "22px !important")
                    }
                    $("#Header #ShopMenu #mini-cart-icon .count").next().remove(".screen-reader-only");
                    $("#Header #ShopMenu #mini-cart-icon .count").css("width", b);
                    $("#Header #ShopMenu #mini-cart-icon .your-cart").prev().remove(".screen-reader-only")
                } else if (a >= 10) {
                    b = "22px";
                    if ($(".grmHeader").length > 0) {
                        b = "30px";
                        $(".bootFix #Header #ShopMenu #mini-cart-icon .count").css("min-width", "30px !important")
                    }
                    $("#Header #ShopMenu #mini-cart-icon .count").next().remove(".screen-reader-only");
                    $("#Header #ShopMenu #mini-cart-icon .count").css("width", b);
                    $("#Header #ShopMenu #mini-cart-icon .your-cart").prev().remove(".screen-reader-only")
                }
            } else {
                $("#Header #ShopMenu #mini-cart-icon .count").css("width", 0);
                this.cartText.text("your cart")
            }
            a == 0 && (a = "")
        }
        this.cartCount.text(a)
    },
    closeMiniCart: function() {
        var a = this;
        clearTimeout(void 0);
        setTimeout(function() {
            a._cartInit && a.hide()
        }, a.delayLeave)
    }
});
Target.register("controller", "headerNew", {
    utils: ["defaultFieldValue"],
    hoverInterval: 1E3,
    delayParam: 3E3,
    maxHits: 7,
    callback: "",
    navTimer: "",
    prevIndex: "",
    currentIndex: "",
    heightParam: "#MainMenu .hover",
    initWrap: "#Header li.leftmenu, #Header li.rightmenu",
    hoverWrap: "#Header .listHoverMenu .hover, #Header .listRightHoverMenu .hover",
    linkWrap: "#Header li.listHoverMenu, #Header li.listRightHoverMenu",
    leftHoverFly: "listHoverMenu",
    rightHoverFly: "listRightHoverMenu",
    leftFly: "leftmenu",
    rightFly: "rightmenu",
    hoverFly: ".hover",
    homeLink: "home-link",
    selectedSearchCategory: "",
    navRequestComponents: {
        sourceComponents: ["dynamicAjaxSlot"]
    },
    skipNavigation: {
        mainBody: {
            id: "mainBody",
            title: "Skip to Main Content"
        },
        leftNav: {
            id: "leftNav",
            title: "Skip to Left Navigation"
        },
        additionalLinks: {
            id: "additionalLinks",
            title: "Additional Site Navigation"
        }
    },
    init: function() {
        this.loadInterface()
    },
    loadInterface: function() {
        var a = this,
            b = "",
            c = Target.globals.autocompleteURL === undefined ? "" : Target.controller.headerNew.getProtocol(Target.globals.autocompleteURL);
        cnetOmni = false;
        tgtGnAccTitle = "";
        a.$body = $("body");
        tgtGnAccTitle = a.$body.find("div.tgt_gn_acc_title:first");
        a.initWrap = $(a.initWrap);
        a.hoverWrap = $(a.hoverWrap);
        a.linkWrap = $(a.linkWrap);
        if ($("body").hasClass("bootFix")) {
            if (typeof Target.globals.verticalNav == "undefined")
                if ($(".globalMenuContainer").length > 0) Target.globals.verticalNav = true;
            setTimeout(function() {
                a.loadGlobalNav()
            }, 3E3)
        } else a.loadGlobalNav();
        a.setMenuControls();
        var e = a.$body.find("div#facetedNav").hasClass("leftNav") ? true : false,
            d;
        for (d in a.skipNavigation) {
            var l =
                a.skipNavigation[d];
            if (l.id !== "leftNav" || l.id === "leftNav" && e === true) b += '<a href="#' + l.id + '">' + l.title + "</a>"
        }
        tgtGnAccTitle.html("");
        tgtGnAccTitle.append(b);
        $("#MainMenu li.more div.hover ul:last").css("background", "none");
        $("#MainMenu > li:not(.home-link)").each(function() {
            var f = $(this),
                g = f.attr("class");
            f.attr("linktype", g)
        });
        a.refreshSearchCategoyList();
        $.fn.CEvent([{
            selector: "#MainMenu .tgt_gn_acc_title a",
            cb: function(f, g, k) {
                f = $(k);
                f = f.closest("li").hasClass("leftmenu") ? f.closest("li.leftmenu") :
                    f.closest("li.rightmenu");
                g = f.find("div.hover");
                f.addClass("showMenu");
                g.find("ul:first a:first").focus()
            }
        }, {
            selector: "a:last",
            eventType: "keypress",
            skipevent: true,
            cb: function(f) {
                f.keyCode === 9 && !f.shiftKey && a.refreshLinks()
            }
        }, {
            selector: ".tgt_gn_acc_title",
            eventType: "focusin",
            skipevent: true,
            cb: function() {
                a.refreshLinks()
            }
        }, {
            selector: "#Login-container",
            eventType: "keypress",
            skipevent: true,
            cb: function(f) {
                if (f.keyCode === 27) {
                    $("#Login-container").fadeOut();
                    $("#OpenLoginPopup").focus()
                }
            }
        }, {
            selector: ".listRightHoverMenu a, .listHoverMenu a",
            eventType: "keydown",
            skipevent: true,
            cb: function(f, g, k) {
                f = f.keyCode;
                k = $(k).parents(".listRightHoverMenu, .listHoverMenu").find(".tgt_gn_acc_title a");
                if (f === 27) {
                    a.refreshLinks();
                    k.focus()
                }
            }
        }, {
            selector: "#headerGuest",
            eventType: "focusin",
            skipevent: true,
            cb: function() {
                $("#Login-container").fadeOut();
                if ($("#headerGuest").text() == "sign out") try {
                    s_clickInteraction("gnav_signout")
                } catch (f) {
                    console.log(f.message)
                }
            }
        }, {
            selector: "#searchMagnify",
            eventType: "submit",
            skipevent: true,
            cb: function(f) {
                var g = $("#searchTerm").val().toLowerCase();
                if (g == "can we help you find something?" || g == "search     " || g == "") {
                    f.preventDefault();
                    return false
                }
            }
        }, {
            selector: "input.autocomplete",
            eventType: "focus",
            skipevent: true,
            cb: function(f, g, k) {
                $(k).attr("autocomplete", "off")
            }
        }, {
            selector: "#ButtonPopupLogin",
            skipevent: true,
            cb: function() {
                var f = Target.globals.loginLinks,
                    g = "",
                    k = "";
                if (f !== undefined) {
                    g = f.currentUrl !== "" ? f.currentUrl : $(location).attr("href");
                    k = f.redirectToURL
                }
                $("#currentUrl").val(g);
                $("#redirectToURL").val(k)
            }
        }, {
            selector: "#OpenLoginPopup",
            skipevent: true,
            cb: function() {
                if (window.self == window.top) document.documentElement.style.display = "block";
                else window.top.location = window.self.location;
                try {
                    s_gnavSignIn()
                } catch (f) {
                    console.log(f.message)
                }
                $("#Login-container").fadeIn();
                $("#email-address").focus();
                return false
            }
        }, {
            selector: "#CloseLoginPopup",
            skipevent: true,
            cb: function() {
                $("#Login-container").fadeOut();
                return false
            }
        }, {
            selector: ".sessionTimeOut .extsession",
            skipevent: true,
            cb: function(f) {
                f.preventDefault();
                Target.handleSessionTimer();
                $(".sessionTimeOut").length ==
                    1 && $(".sessionTimeOut").hide()
            }
        }], a);
        b = function(f) {
            var g = "";
            if (typeof f !== "undefined" && f !== "") g = f.replace(/&amp;/g, "&").replace(/&gt;/g, ">").replace(/&lt;/g, "<").replace(/&quot;/g, '"').replace(/&#039;/g, "'").replace(/&#034;/g, '"');
            return g
        };
        e = function(f) {
            for (var g, k, q = -1, w = (f = f.split("")).length, x = String.fromCharCode; ++q < w;
                (g = f[q].charCodeAt(0)) & 128 && (f[q] = (g & 252) == 192 && ((k = f[q + 1].charCodeAt(0)) & 192) == 128 ? x(((g & 3) << 6) + (k & 63)) : x(128), f[++q] = ""));
            return f.join("")
        };
        d = Target.globals.searchTerm;
        if (typeof d !==
            "undefined") {
            try {
                var n = d.searchTerm;
                if (typeof n !== "undefined" && n !== "") {
                    var t = e(b(n));
                    if ($("#tcinPathInfo") != null && $("#tcinPathInfo").length == 1) t = "search     ";
                    $("#searchTerm").val(t)
                }
            } catch (o) {}
            if (typeof d.selectedCat !== "undefined" && d.selectedCat !== "") {
                $("#SearchCategoryList a").removeClass("checked");
                n = b(d.selectedCat).replace(/(matchallpartial)(?:(?!\|).)*/gi, "matchallpartial");
                t = n.split("|");
                b = $('#SearchCategoryList a[value="' + n + '"]');
                b.length ? b.addClass("checked") : $("#SearchCategoryList ul").prepend('<li><a href="#" name="category" class="checked" title="' +
                    t[3] + '" value="' + n + '">' + t[3] + "</a></li>");
                a.refreshSearchCategoyList()
            }
        }
        a.utils.defaultFieldValue($("#searchTerm"), "search     ");
        a.utils.defaultFieldValue($("#location"), "starting address");
        try {
            $("#searchTerm").autocomplete(c, {
                formatItem: function(f) {
                    if (f[1]) return f[0] + ' <span class="secondary">' + f[1] + "</span>";
                    return f[0]
                },
                cacheLength: 0,
                delay: 0,
                max: 15,
                matchSubset: false,
                minChars: Target.globals.typeaheadCount,
                scroll: false,
                extraParams: {
                    category: function() {
                        return a.getSelectedSearchCategory()
                    }
                }
            }).result(function(f,
                g) {
                if (g[2]) {
                    $(this).val("");
                    $("#searchTerm").val(g[0]);
                    window.location.href = g[2]
                } else this.form.submit()
            }).flushCache()
        } catch (m) {
            console.log(m.message)
        }
        a.searchCategoryList();
        a.bindBodyClicks();
        a.updateTopMenu();
        $(document).delegate("#Header form#Search #SearchCategoryList ul li:first-child,#Header form#Search #SearchCategoryList ul li:last-child", "keydown", function(f) {
            var g = $(this).index();
            if (f.which === 9 && g == 0 && f.shiftKey || g > 0 && !f.shiftKey) a.hideSearchCategoryList()
        });
        a.InitializeAjaxRequest(a.navRequestComponents);
        n = c = "";
        var h = "#ShopMenu";
        if (Target.globals.verticalNav) h = "#ShopNavMenu";
        if (typeof $("input[name=FF_GEO_FEATURE]") !== "undefined") c = (c = $("input[name=FF_GEO_FEATURE]").val()) ? c.toLowerCase() : "";
        if (typeof $("input[name=GN_FF_UI_FLYOUT]") !== "undefined") n = (n = $("input[name=GN_FF_UI_FLYOUT]").val()) ? n.toLowerCase() : "";
        if (c == "on" && a.isCookiesEnabled() != false && n == "on") {
            if (typeof localStorage != "undefined" && localStorage.getItem("defaultStore") != null) {
                c = JSON.parse(localStorage.getItem("defaultStore")).storeName;
                if (c.length > 15) c = a.trimStoreTitle(c, 13);
                $(h + " #defaultHeaderMktStore").text(c);
                $(h + " #defaultMktStore").text(c)
            }
            $(document).delegate("#Header #store-container .storesNearYou .makeStore a", "click", function(f) {
                var g = this.id;
                g = g.split("_");
                a.createDefaultStore(g[1]);
                f.preventDefault();
                $("#Header " + h + " #storeNameDefault a").focus()
            });
            $(document).delegate("#Header #store-container .storeName a", "click", function() {
                var f = this.id,
                    g = "",
                    k = "input[name=FF_FIND_STORE]",
                    q = "input[name=FF_POPULATE_STORE_URL]";
                g =
                    JSON.parse(localStorage.getItem("nearStore"));
                f = f.split("_");
                g = g[f[1]].storeId;
                if (typeof k != "undefined" && typeof q != "undefined") {
                    k = $(k).val();
                    q = $(q).val();
                    k = k.replace("#", g);
                    $.ajax({
                        url: q + g,
                        type: "POST",
                        success: function(w) {
                            if (w) k = w;
                            window.location = k
                        },
                        error: function() {
                            window.location = k
                        }
                    })
                }
            });
            $(document).delegate("#Header #store-container #storeNameDefault a", "click", function() {
                var f = "",
                    g = "input[name=FF_FIND_STORE]",
                    k = "input[name=FF_POPULATE_STORE_URL]";
                f = JSON.parse(localStorage.getItem("defaultStore")).storeId;
                if (typeof g != "undefined" && typeof k != "undefined") {
                    g = $(g).val();
                    k = $(k).val();
                    g = g.replace("#", f);
                    $.ajax({
                        url: k + f,
                        type: "POST",
                        success: function(q) {
                            if (q) g = q;
                            window.location = g
                        },
                        error: function() {
                            window.location = g
                        }
                    })
                }
            });
            $("#Header #store-container .searchStoreWrap #searchStore").click(function() {
                var f = $("#Header #store-container .searchStoreWrap #zipcode").val(),
                    g = "input[name=FF_FIND_MORE_STORE]";
                if (typeof g != "undefined") {
                    g = $(g).val();
                    g = g.replace("#", f);
                    window.location = g
                }
            });
            $("#Header #store-container #zipcode").keyup(function(f) {
                f.keyCode ==
                    13 && $("#searchStore").click()
            });
            $(Target.globals.verticalNav ? ".myStoreClose" : "#searchStore").bind("keydown", function(f) {
                if (!f.shiftKey)
                    if (f.keyCode == 9) {
                        $("#store-container").css("visibility", "hidden");
                        $("#store-container").css("display", "none");
                        $("#Header " + h + " #OpenStorePopup").css("visibility", "visible");
                        $("#Header " + h + " #OpenStorePopup").css("display", "block");
                        $("#Header " + h + " #OpenStorePopup").attr("aria-hidden", "false");
                        $("#Header ul" + h + " li a.storeTitle").attr("aria-hidden", "false");
                        $(this).parents().find("#Header " +
                            h + " a#OpenStorePopup").focus()
                    }
            });
            $(h + " a#OpenStorePopup").click(function() {
                var f = JSON.parse(localStorage.getItem("defaultStore")),
                    g = "";
                a.setFindNearZip();
                if (f != null) {
                    var k = f.storeZip,
                        q = "";
                    g = "";
                    var w = new Date;
                    if (localStorage.getItem("nearStore") === null) {
                        x = "#Header #store-container .defaultStore-section";
                        $(x + " #storeNameDefault a").text(f.storeName);
                        $(x + " #defaultAddress").text(f.storeAddress);
                        $(x + " #defaultPhone").text(f.storePhone);
                        $(x + " #defaultTime").text(a.changeTimeFormat(f.defaultTime));
                        $(x +
                            " #storeTime").text("OPEN TODAY");
                        a.apiStoresNearYou(k)
                    } else {
                        k = JSON.parse(localStorage.getItem("nearStore"));
                        var x = "";
                        shopOpenTitle = "OPEN TODAY";
                        if (w.getDay() < 6) q = f.storeTimeWeek;
                        else if (w.getDay() == 6) q = f.storeTimeSat;
                        else if (w.getDay() == 7) q = k[p].timeSun;
                        g = a.getShopOpenTime(a.getClosingTime(q));
                        if (g == "tomorrow") {
                            shopOpenTitle = "OPEN TOMORROW";
                            q = w.getDay() == 5 ? f.storeTimeSat : w.getDay() == 6 ? f.storeTimeSun : f.storeTimeWeek
                        }
                        x = "";
                        g = f.storeAddress;
                        if (typeof g !== "undefined") {
                            x = g.split(",")[1];
                            if (x === " undefined") g =
                                "&nbsp;"
                        }
                        x = "#Header #store-container .defaultStore-section";
                        $(x + " #storeNameDefault a").text(f.storeName);
                        $(x + " #defaultAddress").html(g);
                        $(x + " #defaultPhone").text(f.storePhone);
                        p = "&nbsp;";
                        if (typeof q !== "undefined") p = a.changeTimeFormat(q);
                        $(x + " #defaultTime").html(p);
                        $(x + " #storeTime").text("OPEN TODAY");
                        g = f.storeName;
                        if (g.length > 15) g = a.trimStoreTitle(g, 13);
                        $(h + " #defaultHeaderMktStore").text(g);
                        $(h + " #defaultMktStore").text(g);
                        $("#Header #store-container .storesNearYou-sections").empty();
                        f = 0;
                        for (var z =
                                $("#Header #store-container .defaultStore-section #storeNameDefault a").text(), p = 0; p < 3; p++)
                            if (k != null)
                                if (typeof k[p] != "undefined") {
                                    shopOpenTitle = "OPEN TODAY";
                                    if (w.getDay() < 5) q = k[p].time;
                                    else if (w.getDay() == 5) q = k[p].timeSat;
                                    else if (w.getDay() == 6) q = k[p].timeSun;
                                    g = a.getShopOpenTime(a.getClosingTime(q));
                                    if (g == "tomorrow") {
                                        shopOpenTitle = "OPEN TOMORROW";
                                        q = w.getDay() == 4 ? k[p].timeSat : w.getDay() == 5 ? k[p].timeSun : k[p].time
                                    }
                                    g = k[p].address;
                                    var r = k[p].phone,
                                        u = a.changeTimeFormat(q);
                                    if (typeof k[p].address !== "undefined") {
                                        x =
                                            k[p].address.split(",")[1];
                                        if (x === " undefined") g = "&nbsp;"
                                    }
                                    if (typeof k[p].phone == "undefined") r = "&nbsp;";
                                    if (typeof u == "undefined") u = "&nbsp;";
                                    if (z != k[p].storeName && f < 2) {
                                        f += 1;
                                        $("#Header #store-container .storesNearYou-sections").append('<div class="storesNearYou-section"><div class="storeName"><a href="#" id="storeName_' + p + '">' + k[p].storeName + '</a></div><div class="makeStore"><a href="#" id="makeStore_' + p + '">make this my store<span class="screen-reader-only">' + k[p].storeName + '</span></a></div><div class="address"><p>' +
                                            g + "</p><p>" + r + '</p><div class="storeTime">' + shopOpenTitle + "</div><div>" + u + " </div></div></div>")
                                    }
                                } else a.geoFfCookies();
                        else a.geoFfCookies()
                    }
                } else {
                    q = Target.controller.header.cookie;
                    k = w = "";
                    a.geoFfCookies();
                    fiatCookieVal = q.read("fiatsCookie");
                    if (typeof fiatCookieVal !== "undefined" && fiatCookieVal !== null) {
                        w = fiatCookieVal.split("|");
                        if (w[2].indexOf("DSZ") == 0) {
                            k = w[2].split("_");
                            k = k[1]
                        }
                    }
                    a.setCookieApiCall("fiatsCookie", 365, "target.com");
                    a.apiStoresNearYou(k)
                }
                $("#store-container").fadeIn();
                $("#Header " + h +
                    " #OpenStorePopup").attr("aria-hidden", "true");
                $("#store-container").css("visibility", "visible");
                $("#store-container").css("display", "block");
                $("#Login-container, #Logedin-container").fadeOut();
                if (!Target.globals.verticalNav) {
                    $("#Header " + h + " #OpenStorePopup").css("visibility", "hidden");
                    $("#Header " + h + " #OpenStorePopup").css("display", "none")
                }
                $("#Header " + h + " #CloseStorePopup").focus()
            });
            $("#Header #store-container #zipcode").focus(function() {
                if ($(this).val() == "ZIP") {
                    $(this).val("");
                    $(this).select()
                }
            }).blur(function() {
                $(this).val() ==
                    "" && $(this).val("ZIP")
            })
        } else {
            $("#Header " + h + " .findStore").css("visibility", "visible");
            $("#Header " + h + " .findStore").css("display", "block");
            $("#Header " + h + " .findStore").closest("li").removeClass("right-arrow");
            $("#Header " + h + " .findStore").closest("li").addClass("shop-menu-item");
            $("#Header " + h + " #OpenStorePopup").css("visibility", "hidden");
            $("#Header " + h + " #OpenStorePopup").css("display", "none")
        }
        a.geoFfCookies();
        $.browser.msie && $.browser.version == "8.0" && $("#searchTerm").css("width", $("#searchTerm").width() -
            54 + "px")
    },
    geoFfCookies: function() {
        var a = "",
            b = Target.controller.header.cookie,
            c = b.read("fiatsCookie");
        if (typeof $("input[name=FF_GEO_FEATURE]") !== "undefined") a = (a = $("input[name=FF_GEO_FEATURE]").val()) ? a.toLowerCase() : "";
        if (a == "on") {
            if (c && typeof c !== "undefined") {
                a = c.split("|");
                if (typeof a[2] != "undefined")
                    if (a[2].indexOf("DSZ") > -1) {
                        a = a[2].split("_");
                        var e = a[1]
                    }
                if (localStorage.getItem("defaultStore") === null) typeof e !== "undefined" && this.getDefaultStore(e);
                else {
                    a = JSON.parse(localStorage.getItem("defaultStore"));
                    var d = c.split("|");
                    if (d[0].indexOf("DSI") > -1) {
                        d = d[0].split("_");
                        d[1] !== "undefined" && d[1] != a.storeId && typeof e !== "undefined" && this.getDefaultStore(e)
                    }
                }
                this.checkDsiDsn() ? this.checkCpref() : this.setCookieApiCall("fiatsCookie", 365, "target.com")
            } else this.setCookieApiCall("fiatsCookie", 365, "target.com");
            setTimeout(function() {
                c = b.read("fiatsCookie");
                !c || c.indexOf("DSI")
            }, 3E3)
        }
    },
    getDefaultStore: function(a) {
        var b, c = this;
        ShopMenuId = "#ShopMenu";
        if (Target.globals.verticalNav) ShopMenuId = "#ShopNavMenu";
        if (typeof $("input[name=FF_V2_STORE_NEAR]") !==
            "undefined") {
            b = $("input[name=FF_V2_STORE_NEAR]").val();
            b = b.replace("#", a)
        }
        jQuery.ajax({
            type: "GET",
            accepts: '{"Content-Type":"application/json"}',
            dataType: "jsonp",
            crossDomain: "true",
            url: b,
            timeOut: 1E3,
            success: function(e) {
                if (e) {
                    var d = e.Locations.Location;
                    if (typeof d == "undefined" || typeof d.length == "undefined") {
                        d = [];
                        if (typeof e.Locations.Location != "undefined") {
                            d.push(e.Locations.Location);
                            d = d[0]
                        }
                    } else d = d[0];
                    if (typeof d !== "undefined") {
                        e = {};
                        if (typeof d.ID !== "undefined") e.storeId = d.ID;
                        if (typeof d.Name !==
                            "undefined") e.storeName = d.Name;
                        if (typeof d.Address !== "undefined") {
                            if (typeof d.Address.AddressLine1 !== "undefined") e.storeAddress = d.Address.AddressLine1;
                            if (typeof d.Address.City !== "undefined") e.storeAddress += ", " + d.Address.City;
                            if (typeof d.Address.Subdivision !== "undefined") e.storeAddress += ", " + d.Address.Subdivision
                        }
                        if (typeof d.Market !== "undefined") {
                            var l = "MKT=" + d.Market.toString().replace(/\,/g, ":");
                            e.mkt = l
                        }
                        if (typeof d.TelephoneNumber !== "undefined")
                            if (typeof d.TelephoneNumber[0] !== "undefined")
                                if (typeof d.TelephoneNumber[0].PhoneNumber !==
                                    "undefined") e.storePhone = d.TelephoneNumber[0].PhoneNumber;
                        if (typeof aLocationOperatingHours !== "undefined") e.defaultTime = d.OperatingHours.Hours[0].TimePeriod.Summary;
                        if (typeof d.Address !== "undefined")
                            if (typeof d.Address.PostalCode !== "undefined") {
                                d = d.Address.PostalCode;
                                d = d.split("-");
                                d = d[0];
                                e.storeZip = d
                            }
                        domVal = "#Header #store-container .defaultStore-section";
                        $(domVal + " #storeNameDefault a").text(e.storeName);
                        $(domVal + " #defaultAddress").text(e.storeAddress);
                        $(domVal + " #defaultPhone").text(e.storePhone);
                        $(domVal + " #defaultTime").text(c.changeTimeFormat(e.defaultTime));
                        $(domVal + " #storeTime").text("OPEN TODAY");
                        d = e.storeName;
                        if (d.length > 15) d = c.trimStoreTitle(d, 13);
                        $(ShopMenuId + " #defaultHeaderMktStore").text(d);
                        $(ShopMenuId + " #defaultMktStore").text(d);
                        localStorage.setItem("defaultStore", JSON.stringify(e))
                    }
                }
            },
            error: function(e) {
                console.log("Ajax error: " + e.message);
                c.createDefaultStore(3)
            }
        })
    },
    checkCpref: function() {
        var a = Target.controller.header.cookie.read("cpref");
        if (!a || typeof a === "undefined") this.setCookieApiCall("cpref",
            7, "target.com")
    },
    checkDsiDsn: function(a) {
        var b = "",
            c = "",
            e = Target.controller.header.cookie,
            d = e.read("fiatsCookie");
        if (d && typeof d !== "undefined") {
            c = d.split("|");
            for (i = 0; i < c.length; i++)
                if (c[i].indexOf("DSI") > -1)
                    for (j = 0; j < 3; j++) typeof c[j] !== "undefined" && c[j].split("_");
            e.read("fiatsCookie");
            for (i = 0; i < c.length; i++)
                if (c[i].indexOf("DSI") > -1) {
                    b += c[i] + "|" + c[i + 1] + "|" + c[i + 2];
                    a && c.splice($.inArray(c[i], c), 2)
                }
        }
        return a ? c.toString().replace(/\,/g, "|") : b
    },
    setFindNearZip: function() {
        var a = this,
            b, c, e = 1E3;
        b = typeof $("input[name=FF_GEO_IP_FINDER]") !==
            "undefined" ? $("input[name=FF_GEO_IP_FINDER]").val() : "";
        e = typeof $("input[name=FF_FIATS_API_TIMEOUT]") !== "undefined" ? $("input[name=FF_FIATS_API_TIMEOUT]").val() : "";
        c = "";
        b && jQuery.ajax({
            type: "GET",
            accepts: '{"Content-Type":"application/json"}',
            dataType: "json",
            crossDomain: "true",
            url: b,
            timeout: e,
            success: function(d) {
                if (d)
                    if (typeof d !== "undefined" && typeof d.geo !== "undefined") {
                        if (typeof d.geo.latitude !== "undefined" && typeof d.geo.longitude !== "undefined") c = d.geo.latitude + "," + d.geo.longitude;
                        if (typeof localStorage !=
                            "undefined" && localStorage.getItem("findNearStoreLatLong") != null) {
                            d = localStorage.getItem("findNearStoreLatLong");
                            if (typeof d !== "undefined" && d !== "" && c !== "" && d !== c) {
                                localStorage.setItem("findNearStoreLatLong", c);
                                a.apiStoresNearYou(c)
                            }
                        } else if (c !== "") {
                            localStorage.setItem("findNearStoreLatLong", c);
                            a.apiStoresNearYou(c)
                        } else c == "" && localStorage.removeItem("nearStore")
                    }
            },
            error: function(d) {
                localStorage.setItem("findNearStoreLatLong", c);
                console.log("Ajax error: " + d.message)
            }
        })
    },
    setCookieApiCall: function(a,
        b, c) {
        var e = this,
            d, l, n, t, o, m, h, f = 1E3,
            g = Target.controller.header.cookie;
        if (a == "fiatsCookie") {
            d = typeof $("input[name=FF_STORE_FINDER]") !== "undefined" ? $("input[name=FF_STORE_FINDER]").val() : "";
            f = typeof $("input[name=FF_FIATS_API_TIMEOUT]") !== "undefined" ? $("input[name=FF_FIATS_API_TIMEOUT]").val() : ""
        } else if (a == "cpref") {
            f = typeof $("input[name=FF_CPREF_API_TIMEOUT]") !== "undefined" ? $("input[name=FF_CPREF_API_TIMEOUT]").val() : "";
            d = typeof $("input[name=FF_V2_STORE_GIVER]") !== "undefined" ? $("input[name=FF_V2_STORE_GIVER]").val() :
                "";
                console.log(e);
            m = e.checkDsiDsn().split("_")[1].split("|")[0];
            d = d.replace("#", m)
        }
        m = JSON.parse(localStorage.getItem("defaultStore"));
        if (a == "cpref" && d && typeof localStorage != "undefined" && localStorage.getItem("defaultStore") != null && typeof m !== "undefined")(o = m.mkt) && o !== "undefined" && g.create(a, o, b, c);
        else if (d) {
            var k = "#ShopMenu";
            if (Target.globals.verticalNav) k = "#ShopNavMenu";
            /Slurp|AdsBot-Google|Googlebot|msnbot|bingbot|MiloBot|AdsBot-Google-Mobile|webcrawler|Googlebot-Mobile|Mediapartners-Google|Googlebot-Image/i.test(navigator.userAgent) ||
                jQuery.ajax({
                    type: "GET",
                    accepts: '{"Content-Type":"application/json"}',
                    dataType: "jsonp",
                    crossDomain: "true",
                    url: d,
                    timeout: f,
                    success: function(q) {
                        if (q) {
                            if (a == "fiatsCookie") {
                                if (typeof q.Locations.Location !== "undefined") {
                                    var w = {};
                                    if (typeof q.Locations.Location.ID !== "undefined") w.storeId = q.Locations.Location.ID;
                                    if (typeof q.Locations.Location.Name !== "undefined") w.storeName = q.Locations.Location.Name;
                                    if (typeof q.Locations.Location.Address !== "undefined") {
                                        if (typeof q.Locations.Location.Address.AddressLine1 !==
                                            "undefined") w.storeAddress = q.Locations.Location.Address.AddressLine1;
                                        if (typeof q.Locations.Location.Address.City !== "undefined") w.storeAddress += ", " + q.Locations.Location.Address.City;
                                        if (typeof q.Locations.Location.Address.Subdivision !== "undefined") w.storeAddress += ", " + q.Locations.Location.Address.Subdivision
                                    }
                                    if (typeof q.Locations.Location.TelephoneNumber !== "undefined")
                                        if (typeof q.Locations.Location.TelephoneNumber[0].PhoneNumber !== "undefined") w.storePhone = q.Locations.Location.TelephoneNumber[0].PhoneNumber;
                                    if (typeof q.Locations.Location.OperatingHours !== "undefined") w.defaultTime = q.Locations.Location.OperatingHours.Hours[0].TimePeriod.Summary;
                                    if (typeof q.Locations.Location.Address !== "undefined")
                                        if (typeof q.Locations.Location.Address.PostalCode !== "undefined") {
                                            h = q.Locations.Location.Address.PostalCode;
                                            h = h.split("-");
                                            h = h[0];
                                            w.storeZip = h
                                        }
                                    l = "DSI_" + q.Locations.Location.ID + "|DSN_" + q.Locations.Location.Name + "|DSZ_" + h;
                                    if (typeof q.Locations.Location.Market !== "undefined") n = "MKT=" + q.Locations.Location.Market.toString().replace(/\,/g,
                                        ":");
                                    o = (t = g.read(a)) ? t.indexOf("DSI") == -1 ? t + "|" + l : l : l;
                                    n && g.create("cpref", n, 7, c);
                                    $("#Header #store-container .defaultStore-section #storeNameDefault a").text(w.storeName);
                                    $("#Header #store-container .defaultStore-section #defaultAddress").text(w.storeAddress);
                                    $("#Header #store-container .defaultStore-section #defaultPhone").text(w.storePhone);
                                    $("#Header #store-container .defaultStore-section #defaultTime").text(e.changeTimeFormat(w.defaultTime));
                                    $("#Header #store-container .defaultStore-section #storeTime").text("OPEN TODAY");
                                    displayStore = w.storeName;
                                    if (displayStore.length > 15) displayStore = e.trimStoreTitle(displayStore, 13);
                                    $(k + " #defaultHeaderMktStore").text(displayStore);
                                    $(k + " #defaultMktStore").text(displayStore);
                                    localStorage.setItem("defaultStore", JSON.stringify(w))
                                }
                            } else if (a == "cpref")
                                if (typeof q.Location !== "undefined")
                                    if (typeof q.Location.Market !== "undefined") o = "MKT=" + q.Location.Market.toString().replace(/\,/g, ":");
                            if (o && o !== "undefined") g.create(a, o, b, c);
                            else a == "fiatsCookie" && e.defaultCookieSet()
                        } else a == "fiatsCookie" &&
                            e.defaultCookieSet()
                    },
                    error: function(q) {
                        a == "fiatsCookie" && e.defaultCookieSet();
                        console.log("Ajax error: " + q.message)
                    }
                })
        } else a == "fiatsCookie" && e.defaultCookieSet()
    },
    defaultCookieSet: function() {
        var a, b, c = Target.controller.header.cookie;
        a = c.read("fiatsCookie");
        var e = "";
        if (typeof $("input[name=FF_DEFAULT_DSI_DSN]") !== "undefined") b = $("input[name=FF_DEFAULT_DSI_DSN]").val();
        (a = a ? a.indexOf("DSI") == -1 ? a + "|" + b : b : b) && a !== "undefined" && c.create("fiatsCookie", a, 365, "target.com");
        (e = this.getExistingCpref()) ? c.create("cpref",
            e, 7, "target.com"): c.erase("cpref");
        this.createDefaultStore(3)
    },
    createDefaultStore: function(a) {
        var b = Target.controller.header.cookie,
            c = JSON.parse(localStorage.getItem("nearStore")),
            e = "",
            d = "",
            l = "",
            n = "",
            t = "#ShopMenu";
        if (Target.globals.verticalNav) t = "#ShopNavMenu";
        localStorage.removeItem("defaultStore");
        if (c != null && a != 3) {
            var o = {};
            o.storeId = c[a].storeId;
            o.storeName = c[a].storeName;
            o.storeAddress = c[a].address;
            o.storePhone = c[a].phone;
            o.storeTimeWeek = c[a].time;
            l = c[a].zip;
            o.mkt = c[a].mkt;
            n = "DSI_" + c[a].storeId +
                "|DSN_" + c[a].storeName + "|DSZ_" + c[a].zip;
            e = c[a].mkt;
            d = Target.controller.header.cookie.read("guestDisplayName");
            if (typeof d != undefined && d != null && d != "")
                if (typeof e != "undefined" & e.indexOf("MKT=") != -1) {
                    e = c[a].mkt.substring(e.indexOf("MKT=") + 4);
                    $.ajax({
                        type: "POST",
                        url: "/store-locator/setdefault_Store",
                        data: "guestSelZipCode=" + c[a].zip + "&guestSelStoreName=" + c[a].storeName + "&guestSelStoreID=" + c[a].storeId + "&market=" + e,
                        global: false,
                        success: function() {}
                    })
                }
        } else {
            c = "input[name=FF_DEFAULT_STORE]";
            a = e = a = "";
            if (typeof $(c) !==
                "undefined") {
                c = $(c).val();
                c = c.split("|");
                o = {};
                o.storeName = c[0];
                o.storeAddress = c[1];
                o.storePhone = c[2];
                o.storeTimeWeek = c[3];
                a = $("input[name=FF_DEFAULT_DSI_DSN]").val();
                a = a.split("|");
                if (a[0].indexOf("DSI") == 0) {
                    a = a[0].split("_");
                    o.storeId = a[1]
                }
            }
            if (typeof $("input[name=FF_DEFAULT_DSI_DSN]") !== "undefined") {
                a = $("input[name=FF_DEFAULT_DSI_DSN]").val();
                e = a.split("|");
                if (e[2].indexOf("DSZ") == 0) {
                    l = e[2].split("_");
                    l = l[1]
                }
                n = a
            }
        }
        localStorage.setItem("defaultStore", JSON.stringify(o));
        d = "";
        c = o.storeAddress;
        a = o.storePhone;
        e = this.changeTimeFormat(o.storeTimeWeek);
        if (typeof o.storeAddress !== "undefined") {
            d = o.storeAddress.split(",")[1];
            if (d === " undefined") c = "&nbsp;"
        }
        if (typeof o.storePhone == "undefined") a = "&nbsp;";
        if (typeof o.storeTimeWeek == "undefined") e = "&nbsp;";
        var m = d = "";
        if (typeof $("input[name=FF_GEO_FEATURE]") !== "undefined") d = (d = $("input[name=FF_GEO_FEATURE]").val()) ? d.toLowerCase() : "";
        if (typeof $("input[name=GN_FF_UI_FLYOUT]") !== "undefined") m = (m = $("input[name=GN_FF_UI_FLYOUT]").val()) ? m.toLowerCase() : "";
        if (d == "on" &&
            this.isCookiesEnabled() != false && m == "on") {
            d = "#Header #store-container .defaultStore-section";
            $(d + " #storeNameDefault a").text(o.storeName);
            $(d + " #defaultAddress").html(c);
            $(d + " #defaultPhone").html(a);
            $(d + " #defaultTime").html(e);
            $(d + " #storeTime").text("OPEN TODAY");
            e = o.storeName;
            if (e.length > 15) e = e.substr(0, 13) + "...";
            $(t + " #defaultHeaderMktStore").text(e);
            $(t + " #defaultMktStore").text(e);
            this.updateStoresNearYou(l)
        }
        n += this.getExistingFiat();
        n && n !== "undefined" && b.create("fiatsCookie", n, 365, "target.com");
        (n = this.getExistingCpref()) ? b.create("cpref", n, 7, "target.com"): b.erase("cpref");
        this.checkCpref()
    },
    updateStoresNearYou: function(a) {
        if (typeof localStorage != "undefined" && localStorage.getItem("nearStore") != null) {
            a = JSON.parse(localStorage.getItem("nearStore"));
            if (typeof a != "undefined") {
                var b = 0,
                    c = new Date;
                $("#Header #store-container .storesNearYou-sections").empty();
                for (var e = $("#Header #store-container .defaultStore-section #storeNameDefault a").text(), d = 0; d < 3; d++)
                    if (typeof a[d] != "undefined") {
                        if (typeof a[d].time !=
                            "undefined" && typeof a[d].timeSat != "undefined" && typeof a[d].timeSun != "undefined") {
                            shopOpenTitle = "OPEN TODAY";
                            if (c.getDay() < 5) shopOpenTime = a[d].time;
                            else if (c.getDay() == 5) shopOpenTime = a[d].timeSat;
                            else if (c.getDay() == 6) shopOpenTime = a[d].timeSun;
                            shopOpen = this.getShopOpenTime(this.getClosingTime(shopOpenTime));
                            if (shopOpen == "tomorrow") {
                                shopOpenTitle = "OPEN TOMORROW";
                                shopOpenTime = c.getDay() == 4 ? a[d].timeSat : c.getDay() == 5 ? a[d].timeSun : a[d].time
                            }
                        }
                        var l = "&nbsp",
                            n = "&nbsp";
                        if (typeof a[d].phone !== "undefined") l =
                            a[d].phone;
                        shopOpenTime = this.changeTimeFormat(shopOpenTime);
                        if (typeof shopOpenTime == "undefined") shopOpenTime = "&nbsp";
                        if (typeof a[d].address !== "undefined") n = a[d].address;
                        if (e != a[d].storeName && b < 2) {
                            b += 1;
                            $("#Header #store-container .storesNearYou-sections").append('<div class="storesNearYou-section"><div class="storeName"><a id="storeName_' + d + '" href="#">' + a[d].storeName + '</a></div><div class="makeStore"><a id="makeStore_' + d + '" href="#">make this my store<span class="screen-reader-only">' + a[d].storeName +
                                '</span></a></div><div class="address"><p>' + n + "</p><p>" + l + '</p><div id="storeTime" class="storeTime">' + shopOpenTitle + "</div><div>" + shopOpenTime + " </div></div></div>")
                        }
                    }
            }
        } else this.apiStoresNearYou(a)
    },
    apiStoresNearYou: function(a) {
        if (typeof localStorage != "undefined" && localStorage.getItem("findNearStoreLatLong") != null) {
            a = localStorage.getItem("findNearStoreLatLong");
            var b, c = this;
            if (typeof $("input[name=FF_V2_STORE_NEAR]") !== "undefined") {
                b = $("input[name=FF_V2_STORE_NEAR]").val();
                b = b.replace("#", a)
            }
            jQuery.ajax({
                type: "GET",
                accepts: '{"Content-Type":"application/json"}',
                dataType: "jsonp",
                crossDomain: "true",
                url: b,
                timeOut: 1E3,
                success: function(e) {
                    if (e) {
                        var d = e.Locations.Location,
                            l = new Date,
                            n = "",
                            t = "";
                        aStoreNear = {};
                        shopOpenTitle = "OPEN TODAY";
                        var o = 0;
                        $("#Header #store-container .storesNearYou-sections").empty();
                        if (typeof d == "undefined" || typeof d.length == "undefined") {
                            d = [];
                            typeof e.Locations.Location != "undefined" && d.push(e.Locations.Location)
                        }
                        e = $("#Header #store-container .defaultStore-section #storeNameDefault a").text();
                        for (var m =
                                0; m < d.length; m++) {
                            aStoreNear[m] = {};
                            aStoreNear[m].storeId = d[m].ID;
                            aStoreNear[m].storeName = d[m].Name;
                            aStoreNear[m].address = d[m].Address.AddressLine1;
                            aStoreNear[m].address += ", " + d[m].Address.City;
                            aStoreNear[m].address += ", " + d[m].Address.Subdivision;
                            if (typeof d[m].TelephoneNumber !== "undefined")
                                if (typeof d[m].TelephoneNumber[0] !== "undefined")
                                    if (typeof d[m].TelephoneNumber[0].PhoneNumber !== "undefined") aStoreNear[m].phone = d[m].TelephoneNumber[0].PhoneNumber;
                            if (typeof d[m].OperatingHours != "undefined") {
                                aStoreNear[m].time =
                                    d[m].OperatingHours.Hours[0].TimePeriod.Summary;
                                aStoreNear[m].timeSat = d[m].OperatingHours.Hours[1].TimePeriod.Summary;
                                aStoreNear[m].timeSun = d[m].OperatingHours.Hours[2].TimePeriod.Summary;
                                shopOpenTitle = "OPEN TODAY";
                                if (l.getDay() < 5) n = aStoreNear[m].time;
                                else if (l.getDay() == 5) n = aStoreNear[m].timeSat;
                                else if (l.getDay() == 6) n = aStoreNear[m].timeSun;
                                shopOpen = c.getShopOpenTime(c.getClosingTime(n));
                                if (shopOpen == "tomorrow") {
                                    shopOpenTitle = "OPEN TOMORROW";
                                    n = l.getDay() == 4 ? aStoreNear[m].timeSat : l.getDay() == 5 ? aStoreNear[m].timeSun :
                                        aStoreNear[m].time
                                }
                            }
                            if (typeof d[m].Market !== "undefined") {
                                t = "MKT=" + d[m].Market.toString().replace(/\,/g, ":");
                                aStoreNear[m].mkt = t
                            }
                            if (typeof d[m].Address.PostalCode !== "undefined") {
                                t = d[m].Address.PostalCode;
                                t = t.split("-");
                                aStoreNear[m].zip = t[0]
                            }
                            localStorage.setItem("nearStore", JSON.stringify(aStoreNear));
                            var h = t = "&nbsp";
                            if (typeof aStoreNear[m].phone !== "undefined") t = aStoreNear[m].phone;
                            n = c.changeTimeFormat(n);
                            if (typeof n == "undefined") n = "&nbsp";
                            if (typeof d[m].Address.AddressLine1 !== "undefined") h = aStoreNear[m].address;
                            if (e != aStoreNear[m].storeName && o < 2) {
                                o += 1;
                                $("#Header #store-container .storesNearYou-sections").append('<div class="storesNearYou-section"><div class="storeName"><a id="storeName_' + m + '" href="#">' + aStoreNear[m].storeName + '</a></div><div class="makeStore"><a id="makeStore_' + m + '" href="#">make this my store<span class="screen-reader-only">' + aStoreNear[m].storeName + '</span></a></div><div class="address"><p>' + h + "</p><p>" + t + '</p><div id="storeTime" class="storeTime">' + shopOpenTitle + "</div><div>" + n + " </div></div></div>")
                            }
                        }
                    }
                },
                error: function(e) {
                    console.log("Ajax error: " + e.message);
                    c.createDefaultStore(3)
                }
            })
        }
    },
    getExistingFiat: function() {
        var a = "",
            b = "";
        a = Target.controller.header.cookie.read("fiatsCookie");
        if (typeof a !== "undefined" && a != null) {
            a = a.split("|");
            for (i = 0; i < a.length; i++) b += a[i].indexOf("DSI_") > -1 || a[i].indexOf("DSN_") > -1 || a[i].indexOf("DSZ_") > -1 ? "" : b != "" ? "|" + a[i] : a[i]
        }
        return b
    },
    getExistingCpref: function() {
        var a = "",
            b = "";
        a = Target.controller.header.cookie.read("cpref");
        if (typeof a !== "undefined" && a != null) {
            a = a.split("|");
            for (i = 0; i < a.length; i++) b += a[i].indexOf("MKT=") > -1 ? "" : b != "" ? "|" + a[i] : a[i]
        }
        return b
    },
    trimStoreTitle: function(a, b) {
        if (a != null) return a.length > b ? a.substr(0, b) + "..." : a
    },
    getShopOpenTime: function(a) {
        var b = new Date;
        openTime = b.getHours() + "." + b.getMinutes();
        return openTime > a && openTime < 23.59 ? "tomorrow" : "today"
    },
    getClosingTime: function(a) {
        var b = "",
            c = "";
        b = "";
        if (typeof a !== "undefined") {
            b = a.split(/[- ]/);
            c = b[2];
            b = b[3];
            if (typeof c != "undefined") {
                c = c.replace(":", ".");
                if (b == "p.m.") c = parseInt(c) + parseInt(12)
            }
            return c
        }
    },
    isCookiesEnabled: function() {
        var a = navigator.cookieEnabled;
        if (a === false) return false;
        if (!document.cookie && (a === null || 0)) {
            document.cookie = "testcookie=1";
            if (document.cookie) document.cookie = "testcookie=; expires=" + (new Date(0)).toUTCString();
            else return false
        }
        return true
    },
    changeTimeFormat: function(a) {
        if (a && typeof a !== "undefined") return a.replace(/[.]/g, "")
    },
    setMenuControls: function() {
        var a = null,
            b = null,
            c = null,
            e = $("#ShopMenu"),
            d = $("#MainMenu"),
            l = false,
            n = function() {
                var o, m, h = $(this);
                o = h.position().left -
                    78;
                m = o + h.innerWidth() + 78;
                if ($(".showMenu").length == 0) b = setTimeout(function() {
                    h.append('<div class="menuLiBase leftBase" style="top:22px;left:' + o + 'px"></div>');
                    h.append('<div class="menuLiBase rightBase" style="top:22px;left:' + m + 'px"></div>');
                    h.addClass("showMenu")
                }, 100);
                $("li.lastl2 ul").addClass("lastNoBorder");
                $(".hover div.opnCont").find(":lt(3) ul:last-child").addClass("lastNoBorder");
                l = this
            },
            t = function() {
                $(this).removeClass("showMenu");
                d.find(".menuLiBase").remove();
                l = false
            };
        if ("ontouchstart" in
            window || window.DocumentTouch && document instanceof DocumentTouch ? true : false) {
            d = $("#MainMenu");
            $("body").delegate("#Header span.triggerHover", "touchstart", function() {
                $(".menuBox").addClass("active")
            });
            $("body").delegate(".menuBox", "touchstart", function() {
                $(".menuBox").addClass("active")
            });
            $("body").delegate("ul#MainMenu.gb-menu > li", "click touchstart touchend", function(o) {
                var m = $(this),
                    h = $.jStorage.get("globalNav");
                if (h && m.parent("li").find("div.hover").length == 0) {
                    var f = m.attr("menuVal");
                    m.append(h[f])
                }
                if (!m.hasClass("showMenu")) {
                    l &&
                        t.call($(l));
                    o.type == "touchend" && $(this).click(function() {});
                    n.call(this);
                    $("body").bind("click.submenu touchend.submenu", function(g) {
                        g = $(g.target);
                        if (!g.hasClass("hover") && !g.parents(".hover").length) {
                            t.call($(l));
                            $(this).unbind("click.submenu touchend.submenu")
                        }
                    })
                }
            })
        } else {
            Target.globals.verticalNav && $("#Header ul#MainMenu.gb-menu>li").bind("click", function() {
                clearTimeout(a);
                n.call(this)
            });
            d.delegate("li.leftmenu, li.rightmenu", "mouseenter", function() {
                clearTimeout(a);
                n.call(this)
            });
            d.delegate("li.leftmenu, li.rightmenu",
                "mouseleave",
                function() {
                    MenuItem = $(this);
                    clearTimeout(b);
                    a = setTimeout(function() {
                        MenuItem.removeClass("showMenu");
                        $("#Header .globalMenuContainer").removeClass("flyout-4-column");
                        t.call(this)
                    }, 300)
                });
            e.delegate("li", "mouseenter", function() {
                c = $(this);
                a = setTimeout(function() {
                    c.addClass("showSubMenu")
                }, 50)
            });
            e.delegate("li", "mouseleave", function() {
                c = $(this);
                clearTimeout(a);
                c.removeClass("showSubMenu")
            })
        }
    },
    getUserStatus: function() {
        var a = Target.controller.header.cookie,
            b = a.getUserID(),
            c = "Not Logged in and not registered";
        if (b != null && b != "")
            if (a.read("guestDisplayName") != null && a.read("WC_USERACTIVITY_" + b) != null && a.read("WC_PERSISTENT") != null) c = "Logged in";
            else if (a.read("guestDisplayName") != null && a.read("WC_USERACTIVITY_" + b) == null && a.read("WC_PERSISTENT") != null) c = "Not Logged in and Registered";
        return c
    },
    getProtocol: function(a) {
        if (a != undefined) {
            console.log("a",a);
            var b = a.split("://")[1];
             console.log("b",b);
             console.log("location protocol",("http://" + b));
            // comenting this out //return b === undefined ? a : location.protocol + "//" + b
            return b === undefined ? a : "http://" + b
        }
    },
    getRRProtocol: function(a) {
        if (a != undefined) return a === undefined ? a : location.protocol + "//" + a
    },
    globalNavNew: function() {
        var a =
            $.jStorage.get("globalNav");
        Target.globals.verticalNav && $("body").delegate("ul#MainMenu.gb-menu li", "click", function(b) {
            var c = b.currentTarget,
                e = $(this);
            if (a && e.find("div.hover").length == 0) {
                var d = e.attr("menuVal");
                e.append(a[d])
            }
            b.stopPropagation();
            $(c).hasClass("leftmenu") && $(c).closest("li.leftmenu").addClass("showMenu").find("div.hover ul:first a:first").focus()
        });
        $("body").delegate("#MainMenu > li", "mouseenter", function() {
            var b = $(this);
            if (a && b.find("div.hover").length == 0) {
                var c = b.attr("menuVal");
                b.append(a[c]);
                if (b.find(".hover_ie7 > ul").length == 4) {
                    b = $("#Header .globalMenuContainer");
                    b.hasClass("flyout-4-column") || b.addClass("flyout-4-column")
                }
            }
        });
        $("body").delegate("#CloseStorePopup", "keydown", function(b) {
            if (b.shiftKey)
                if (b.keyCode == 9) {
                    $("#store-container").fadeOut();
                    $("#OpenStorePopup").attr("aria-hidden", "false")
                }
        });
        $("body").delegate("#CloseStorePopup, #store-container .storesNearYou p a.myStoreClose", "click", function(b) {
            b.stopPropagation();
            b = $(this).parents().find("#OpenStorePopup").text();
            $("#store-container").fadeOut();
            $(this).parents().find("#OpenStorePopup").attr("aria-label", b);
            $("#OpenStorePopup").attr("aria-hidden", "false").focus()
        });
        $("body").delegate("#store-container", "keydown", function(b) {
            if (b.keyCode == 27) {
                $("#store-container").fadeOut();
                $("#OpenStorePopup").attr("aria-hidden", "false").focus()
            }
        });
        $("body").delegate(".tgt_gn_acc_title a", "click keypress, focus", function() {
            var b = $(this);
            if (a && b.parents("li").find("div.hover").length == 0) {
                var c = b.parents("li").attr("menuVal");
                c = a[c];
                b.parents("li").append(c)
            }
        })
    },
    loadGlobalNav: function() {
        var a = this,
            b = $("#MainMenu"),
            c = $("body"),
            e = Target.globals.AjaxGlobalNavPath;
        if (!(c.hasClass("checkout") && location.href.search("checkout_cartview") == -1 && !c.hasClass("confirmation") || typeof e == "undefined"))
            if ($.jStorage.get("globalNav") && e.indexOf("&isPreview=Y")) {
                a.setMenuControls();
                a.globalNavNew()
            } else $.ajax({
                url: Target.controller.headerNew.getProtocol(e),
                type: "GET",
                data: null,
                curtain: false,
                dataType: "jsonp",
                jsonpCallback: "GlobalNavCategories",
                success: function(d) {
                    e.indexOf("&isPreview=Y") >= 0 && $.jStorage.get("globalNav") && $.jStorage.deleteKey("globalNav");
                    if (e.indexOf("&version=v1") >= 0) {
                        if (!$.jStorage.get("globalNav")) {
                            if (typeof Target.globals.tapestryFlag == "undefined" || Target.globals.tapestryFlag == "OFF") {
                                var l = JSON.stringify(d.GlobalNavTitle),
                                    n = RegExp("(<ul><li><span class=)[^(flyoutImage)]*(flyoutImage)[^>]*>(.*?)(</span></li></ul>)", "g");
                                l = l.replace(n, "");
                                l = JSON.parse(l);
                                $.jStorage.set("globalNav", l)
                            } else $.jStorage.set("globalNav", d.GlobalNavTitle);
                            if (typeof Target.globals.matryoshkaFlag == "undefined" || Target.globals.matryoshkaFlag == "OFF") {
                                l = JSON.stringify(d.GlobalNavTitle);
                                n = RegExp("(<span class=)[^(leftnav_promo)]*(leftnav_promo)[^>]*>(.*?)(</span>)", "g");
                                l = l.replace(n, "");
                                l = JSON.parse(l);
                                $.jStorage.set("globalNav", l)
                            } else $.jStorage.set("globalNav", d.GlobalNavTitle);
                            $.jStorage.setTTL("globalNav", 144E5)
                        }
                        a.setMenuControls();
                        a.globalNavNew()
                    } else {
                        b.replaceWith(d.GlobalNavTitle);
                        a.setMenuControls()
                    }
                },
                error: function(d) {
                    console.log("error: " + d)
                }
            })
    },
    searchTerm: function() {
        var a = ["at Target", ": Target"],
            b, c = document.title;
        for (i = 0; i <= a.length - 1; i++)
            if (c.search(a[i]) > 0) b = c.replace(a[i], "").replace(/\W*$/, "");
        return b
    },
    refreshLinks: function() {
        var a = this;
        $("#MainMenu > li:not(.home-link)").each(function() {
            var b = $(this);
            b.removeClass("showMenu").addClass(b.attr("linktype"));
            b.children(a.hoverFly).hide()
        })
    },
    bindBodyClicks: function() {
        var a = this,
            b = $("body");
        b.bind("touchstart", function(c) {
            if ($(c.target).parents(".hover_ie7").length < 1) {
                $(".hover_ie7").closest("li").removeClass("showMenu");
                if (typeof isGlobalHomePage == "undefined" || isGlobalHomePage == false) $(c.target).parents(".menuBox").length < 1 && $(".menuBox").removeClass("active")
            }
        });
        b.bind("click", function(c) {
            var e = $("#Login-container"),
                d = $("#SearchCategoryList"),
                l = $(".search-standard"),
                n = $(c.target).find(".search-standard"),
                t = $("#store-container");
            screenReader = l.parent().find("ul li a span.screen-reader-only");
            $(c.target).parents("#Login-container").length < 1 && e.is(":visible") && e.fadeOut();
            e = $(c.target).attr("id");
            $.inArray(e, ["defaultHeaderMktStore",
                "storeDownArrow", "OpenStorePopup", "mystoreText"
            ]) == -1 && $(c.target).parents("#store-container").length < 1 && t.is(":visible") && t.fadeOut(function() {
                $("#Header #ShopMenu #OpenStorePopup").attr("aria-hidden", "false");
                $("#OpenStorePopup").show();
                $("#Header #ShopMenu  #OpenStorePopup").css("visibility", "visible");
                $("#Header #ShopMenu  #OpenStorePopup").css("display", "block")
            });
            if (n.length > 0 && l.is(":visible")) {
                l.addClass("hidden");
                screenReader.html("expand")
            }
            if ($(c.target).parents("#SearchCategoryList").length <
                1 && d.is(":visible")) {
                a.hideSearchCategoryList();
                return false
            }
        });
        $("#Header").delegate("form#Search", "submit", function() {
            var c = $("#searchTerm"),
                e = RegExp(/\)|\(|\*|\&|\^|\%|\$|\#|\@|\!|\~|\<|\>|\?|\:|\"|\,|\.|\/|\;|\'|\-|\=|\_|\+|\[|\]|\{|\}|\\|\||\`/g);
            if ((e = c.val().length == 1 && e.test(c.val())) || $.trim(c.val()) == "") c.val("");
            if (!c.val() || c.val() == "search     " || e) return false;
            return true
        })
    },
    searchCategoryList: function() {
        var a = this;
        $("div").delegate("#SearchCategories", "click", function(b) {
            b.preventDefault();
            b.stopPropagation();
            var c = $("#SearchCategoryList"),
                e = $(this),
                d = $("#categoryListTypeVal");
            c.slideToggle(200, function() {
                if (c.is(":visible")) {
                    e.addClass("selected");
                    d.html("&nbsp;Collapse List")
                } else {
                    e.removeClass("selected");
                    d.html("&nbsp;Expand List")
                }
            });
            c.find("a:first").focus()
        });
        $("#searchMagnify").bind("focus", function() {
            a.hideSearchCategoryList()
        });
        $("#SearchCategoryList label").bind("mouseover", function() {
            $(this).addClass("over")
        });
        $("#SearchCategoryList label").bind("mouseout", function() {
            $(this).removeClass("over")
        });
        $("#SearchCategoryList a").bind("keyup", function(b) {
            a.refreshSearchCategoyList();
            if (b.keyCode === 27) {
                a.hideSearchCategoryList();
                $("#SearchCategories").focus()
            }
        });
        $("#SearchCategoryList a").bind("click", function() {
            $("#SearchCategoryList a.checked").removeClass("checked");
            $(this).addClass("checked");
            $("#category").val($(this).attr("value"));
            a.refreshSearchCategoyList();
            a.hideSearchCategoryList();
            setTimeout(function() {
                $("#searchTerm").focus()
            }, 0);
            var b = $("#searchTerm");
            b.val().indexOf("search") >= 0 && b.val("");
            $.browser.msie && $.browser.version == "8.0" && $("#searchTerm").css("width", "100%").css("width", $("#searchTerm").width() - 54 + "px")
        })
    },
    getSelectedSearchCategory: function() {
        return self.selectedSearchCategory
    },
    refreshSearchCategoyList: function() {
        var a = $("#SearchCategoryList a.checked"),
            b = a.text();
        a = a.attr("value");
        if (b.length > 20 && b !== "all categories") b = $.trim(b.substring(0, 20)) + "...";
        b = b.replace("all categories", "all");
        $("#selectedCategory").text(b);
        $("#category").val(a)
    },
    hideSearchCategoryList: function() {
        var a =
            $("#categoryListTypeVal");
        $("#searchTerm").css({
            color: "#999999",
            "font-size": "12px"
        });
        $("#SearchCategoryList").slideUp(200, function() {
            $("#SearchCategories").removeClass("selected")
        });
        a.html("&nbsp;Expand List")
    },
    updateTopMenu: function() {
        var a = null,
            b = Target.controller.header;
        if (b.cookie.read("guestDisplayName") != null) {
            var c = b.cookie.read("guestDisplayName");
            a = c.match(/GDN\=\w+\|?/);
            a = a != null ? escape(a[0].replace("GDN=", "").replace("|", "")) : escape(c);
            if (a.indexOf("%20") != -1) a = a.replace(/%20/g, " ");
            if (a.indexOf("%27") !=
                -1) a = a.replace(/%27/g, "'")
        }
        var e = $("a#OpenLoginPopup"),
            d = $("a#headerMyAccount"),
            l = $("a#headerGuest");
        c = a;
        var n = typeof c !== "undefined" && c && c.length > 22 ? $.trim(c).substring(0, 22) + " ..." : c;
        b = b.cookie.read("cartQty");
        var t = b !== null ? b.split("|") : 0,
            o = Target.globals.loginWrapper;
        b = "large-text";
        var m = function(h, f) {
            h.obj.replaceWith(h.response.url === "" ? h.response.text + f : '<a href="' + h.response.url + '" title="' + h.response.title + '" id="' + h.response.id + '" rel="nofollow" >' + h.response.text + "</a>")
        };
        if (o !== undefined) {
            welcomeText =
                c !== null ? o.welcomeLoggedUser : o.welcomeGuestUser;
            $("#HomePageHeaderContainer h1.large-text, #HomePageHeaderContainer div.hello-tag").val(welcomeText);
            responseObj = c !== null ? o.LoggedUser : o.guestUser;
            m({
                obj: e,
                response: responseObj.welcome
            }, n);
            m({
                obj: d,
                response: responseObj.myAccount
            }, "");
            m({
                obj: l,
                response: responseObj.loginStatus
            }, "");
            c !== null && $(document).trigger("session-start.framework")
        }
        minCartCount = parseInt(t) !== null && t != 0 ? t[0] : 0;
        $("a#mini-cart-icon span.count").text(" " + minCartCount + " ");
        if (Target.globals.verticalNav)
            if (minCartCount ==
                0) {
                $("#Header #ShopMenu #mini-cart-icon .count").text("");
                $("#mini-cart-icon .count").after("<span class='screen-reader-only'>&nbsp;0</span>");
                $(".your-cart").before("<span class='screen-reader-only'>in&nbsp;</span>");
                $(".your-cart").text("your cart");
                $("#Header #mini-cart-icon .count").css("width", 0);
                $("#Header #mini-cart-icon .count").css("padding-right", 0)
            } else if (minCartCount < 10) {
            $("#mini-cart-icon .count").after("<span class='screen-reader-only'></span>");
            $(".your-cart").text(" in your cart");
            e = "14px";
            if ($(".grmHeader").length > 0) {
                e = "24px";
                $(".bootFix #Header #ShopMenu #mini-cart-icon .count").css("min-width", "22px !important")
            }
            $("#Header #mini-cart-icon .count").css("width", e)
        } else if (minCartCount >= 10) {
            $(".your-cart").text(" in your cart");
            e = "22px";
            if ($(".grmHeader").length > 0) {
                e = "30px";
                $(".bootFix #Header #ShopMenu #mini-cart-icon .count").css("min-width", "30px !important")
            }
            $("#Header #mini-cart-icon .count").css("width", e)
        }
        if (a == null) a = "";
        if (a.length > 18) {
            a = a.substring(0, 18) + " ...!";
            e =
                "<abbr title='" + c + "'>";
            a = $("#HomePageHeaderContainer #categoryHeader h1").text().replace("!", e + a + "</abbr>");
            b = "small-text"
        } else a = $("#HomePageHeaderContainer #categoryHeader h1").text().replace("!", a + "!");
        $("#HomeGreetings span").html(c);
        $("#HomePageHeaderContainer #categoryHeader").removeAttr("class");
        $("#HomePageHeaderContainer #categoryHeader h1").html(a);
        $("#HomePageHeaderContainer #categoryHeader").addClass(b);
        $("#HomePageHeaderContainer #categoryHeader h1,#HomePageHeaderContainer #categoryHeader h1 *").css("visibility",
            "visible")
    },
    omnUserStatus: function() {
        var a = Target.controller.header.cookie,
            b = a.getUserID(),
            c = "Not Logged in and not registered";
        if (b != null && b != "")
            if (a.read("guestDisplayName") != null && a.read("WC_USERACTIVITY_" + b) != null && a.read("WC_PERSISTENT") != null) c = "Logged in";
            else if (a.read("guestDisplayName") != null && a.read("WC_USERACTIVITY_" + b) == null && a.read("WC_PERSISTENT") != null) c = "Not Logged in and Registered";
        return c
    },
    InitializeAjaxRequest: function(a) {
        var b = [],
            c = $("#dynamicAjaxURL").val(),
            e = this;
        e.$body.find("div." +
            a.sourceComponents).each(function() {
            $(this).attr("id") !== "PLP_For_Grid" && b.push($(this).attr("id"))
        });
        if (b.length > 0) {
            e = this;
            var d = a.successMethod ? a.successMethod : e.updateSourceComponents;
            $.ajax({
                url: Target.controller.headerNew.getProtocol(c),
                type: "POST",
                data: $("form#dynamicAjaxFrm").serialize(),
                dataType: "json",
                curtain: false,
                success: function(l) {
                    d.call(e, l, b);
                    Target.controller.globalUtils.checkIfCarousal(".component-carousel-1");
                    Target.controller.globalUtils.checkIfCarousal(".component-carousel-3");
                    Target.controller.globalUtils.checkIfCarousal(".component-carousel-4");
                    Target.controller.globalUtils.checkIfCarousal(".component-carousel-5");
                    Target.controller.globalUtils.checkIfCarousal(".component-carousel-recmm-4");
                    $(".component-carousel-4coloumns").tileCarousel({
                        increment: 4,
                        pagination: true,
                        centerPagination: false,
                        encapsulateControls: true
                    });
                    $(".tipnoteTrigger").tipNote();
                    Target.controller.globalUtils.expandDescComponent();
                    var n = b.length;
                    if (n == 0) return false;
                    var t = slotIds = espotIds = campaignIds = componentIds =
                        "";
                    $.each(b, function(m, h) {
                        t += $("#contentID_" + h).val();
                        slotIds += $("#slotID_" + h).val();
                        espotIds += $("#espotID_" + h).val();
                        campaignIds += $("#campaignID_" + h).val() != "" ? $("#campaignID_" + h).val() : null;
                        componentIds += $("#componentID_" + h).length ? $("#componentID_" + h).val() : null;
                        if (m != n - 1) {
                            t += ",";
                            slotIds += ",";
                            espotIds += ",";
                            campaignIds += ",";
                            componentIds += ","
                        }
                    });
                    if (typeof s != "undefined") s.prop3 = "";
                    try {
                        s_contentImpression(t, slotIds, espotIds, componentIds, "", campaignIds)
                    } catch (o) {
                        console.log(o.message)
                    }
                },
                error: function() {
                    this.errorMethod &&
                        this.errorMethod()
                }
            })
        }
        return false
    }
});
$(document).ready(function() {
    if (typeof isGlobalHomePage != "undefined" && isGlobalHomePage == true) {
        $(".triggerHover").after("<span class='triggerHover'> shop all categories</span>");
        $("a.triggerHover").remove();
        $(".menuBox").addClass("active");
        $("#Header .globalMenuContainer .menuBox a.triggerHover span.screen-reader-only").remove()
    } else {
        var a = $("#Header a.triggerHover span.screen-reader-only");
        $(".menuBox").removeClass("active");
        $("body").delegate(".menuBox", "mouseenter", function() {
            delayMenu = setTimeout(function() {
                $(".menuBox").addClass("active");
                a.html("&nbsp;Collapse")
            }, 200)
        });
        $("body").delegate(".menuBox", "mouseleave", function() {
            clearTimeout(delayMenu);
            $(this).removeClass("active");
            a.html("&nbsp;expand")
        });
        $(".triggerHover a").keydown(function() {
            $(".menuBox").hasClass("active") || (delayMenu = setTimeout(function() {
                $(".menuBox").addClass("active");
                a.html("&nbsp;Collapse")
            }, 200))
        });
        $(".menuBox").hasClass("active") ? $(".menuBox>.tgt_gn_acc_title>a").html("Collapse shop all categories") : $(".menuBox>.tgt_gn_acc_title>a").html("Expand shop all categories");
        $(".menuBox>.tgt_gn_acc_title>a").click(function(u) {
            u.preventDefault();
            $(this).parent().parent().toggleClass("active");
            $(".menuBox").hasClass("active") ? $(".menuBox>.tgt_gn_acc_title>a").html("Collapse shop all categories") : $(".menuBox>.tgt_gn_acc_title>a").html("Expand shop all categories")
        })
    }
    $("body").delegate("a.triggerHover", "click keyup", function(u) {
        if (typeof isGlobalHomePage == "undefined" || isGlobalHomePage == false)
            if (u.type == "keyup" && u.keyCode == "27") {
                $("#Header a.triggerHover span.screen-reader-only").html("&nbsp;expand");
                $(this).parents().find("div.menuBox").removeClass("active")
            } else if (u.type == "click") {
            u.preventDefault();
            $(".menuBox").addClass("active")
        }
    });
    $(".mystoreText").attr("id", "mystoreText");
    $("body").delegate("#ShopNavMenu a#OpenREDcardPopup", "click", function(u) {
        $("#REDcard-container").fadeIn();
        $("#Header ul#ShopNavMenu li a#CloseREDcardPopup span.screen-reader-only").text("collapse");
        $("#Login-container, #Logedin-container").fadeOut();
        $("#OpenLogedinPopup").removeAttr("tabindex");
        $("#OpenLogedinPopup").attr("aria-hidden",
            "false");
        $("#OpenREDcardPopup").attr("aria-hidden", "true");
        u.stopPropagation();
        $("#Header ul#ShopNavMenu li a#CloseREDcardPopup").attr("tabindex", "0");
        $("#Header ul#ShopNavMenu li a#CloseREDcardPopup").focus();
        $("#store-container").fadeOut()
    });
    $("<a class='mini-cart-arrow' rel='nofollow' href='#'>Mini Cart Expand</a>").insertAfter("#ShopMenu #mini-cart-icon").mouseenter(function() {
        $("#Header .globalMenuContainer").addClass("changeCartRoundBg");
        $("#mini-cart-wrapper").removeClass("mini-cart-wrapper-leave");
        $(".mini-cart-arrow").removeClass("mini-cart-arrow-leave");
        $("#mini-cart-wrapper").addClass("mini-cart-wrapper-enter");
        $(".mini-cart-arrow").addClass("mini-cart-arrow-enter")
    }).mouseleave(function() {
        $("#Header .globalMenuContainer").removeClass("changeCartRoundBg");
        $("#mini-cart-wrapper").removeClass("mini-cart-wrapper-enter");
        $(".mini-cart-arrow").removeClass("mini-cart-arrow-enter");
        $("#mini-cart-wrapper").addClass("mini-cart-wrapper-leave");
        $(".mini-cart-arrow").addClass("mini-cart-arrow-leave")
    });
    $("#UserMenu li #OpenLoginPopup").length && $("#UserMenu li:first>a, #CloseLoginPopup").html("sign in / account");
    var b = null,
        c = Target.controller.header;
    if (c.cookie.read("guestDisplayName") != null) {
        b = c.cookie.read("guestDisplayName");
        c = b.match(/GDN\=\w+\|?/);
        b = c != null ? escape(c[0].replace("GDN=", "").replace("|", "")) : escape(b);
        if (b.indexOf("%20") != -1) b = b.replace(/%20/g, " ");
        if (b.indexOf("%27") != -1) b = b.replace(/%27/g, "'");
        var e = "",
            d = "",
            l = "",
            n = "manage my account",
            t = "",
            o = "",
            m = "",
            h = "track an order",
            f = "",
            g =
            "",
            k = "",
            q = "return an item",
            w = c = "",
            x = "",
            z = "sign out";
        if (typeof Target.globals.loginWrapperVert !== "undefined") {
            var p = Target.globals.loginWrapperVert;
            if (typeof p.LoggedUser !== "undefined") {
                p = p.LoggedUser;
                if (p.manageAccount !== "undefined") {
                    var r = p.manageAccount;
                    if (typeof r.id !== "undefined") d = r.id;
                    if (typeof r.url !== "undefined") e = r.url;
                    if (typeof r.title !== "undefined") l = r.title;
                    if (typeof r.text !== "undefined") n = r.text;
                    r = p.trackOrder;
                    if (typeof r.id !== "undefined") o = r.id;
                    if (typeof r.url !== "undefined") t = r.url;
                    if (typeof r.title !== "undefined") m = r.title;
                    if (typeof r.text !== "undefined") h = r.text;
                    r = p.returnItem;
                    if (typeof r.id !== "undefined") g = r.id;
                    if (typeof r.url !== "undefined") f = r.url;
                    if (typeof r.title !== "undefined") k = r.title;
                    if (typeof r.text !== "undefined") q = r.text;
                    p = p.signOut;
                    if (typeof p.id !== "undefined") w = p.id;
                    if (typeof p.url !== "undefined") c = p.url;
                    if (typeof p.title !== "undefined") x = p.title;
                    if (typeof p.text !== "undefined") z = p.text
                }
            }
        }
        e = "<a id ='" + d + "' href='" + e + "' title='" + l + "'>" + n + "</a>";
        t = "<a id ='" + o + "' href='" +
            t + "' title='" + m + "'>" + h + "</a>";
        f = "<a id ='" + g + "' href='" + f + "' title='" + k + "'>" + q + "</a>";
        c = "<a id ='" + w + "' href='" + c + "' title='" + x + "'>" + z + "</a>";
        $("#UserMenu li > #OpenLoginPopup").remove();
        $("#UserMenu li").html("<a href='javascript:void(0)' id='OpenLogedinPopup' rel='nofollow' aria-hidden='false'>" + b + "</a>");
        $("<div id='Logedin-container' style='display: none; visibility: hidden;'><div class='closeLogedin'><a href='javascript:void(0);' id='CloseLogedinPopup' aria-hidden='false'></a> <span class='up-arrow'></span></div><div class='box'><p class='section'> " +
            e + "</p><div class='section'><p>order history</p> <p>" + t + "</p><p>" + f + "</p></div> <p>" + c + "</p><p> <a class='signinClose' href='#'>&nbsp; collapse</a> </p></div></div>").insertAfter("#OpenLogedinPopup")
    }
    if (b) {
        if (b.length > 10) {
            $("#OpenLogedinPopup").html("Hi " + $.trim(b.substring(0, 10)) + "...<span class='screen-reader-only'>&nbsp; expand</span><span class='down-arrow'></span>");
            $("#CloseLogedinPopup").html("Hi " + $.trim(b.substring(0, 10)) + "...<span class='screen-reader-only'>&nbsp; collapse</span>")
        } else {
            $("#OpenLogedinPopup").html("Hi " +
                b + "<span class='screen-reader-only'>&nbsp; expand</span><span class='down-arrow'></span>");
            $("#CloseLogedinPopup").html("Hi " + b + "<span class='screen-reader-only'>&nbsp; collapse</span>")
        }
        $("#OpenLogedinPopup").css("textTransform", "capitalize");
        $("#CloseLogedinPopup").css("textTransform", "capitalize")
    }
    $("body").delegate("#OpenLogedinPopup", "click", function(u) {
        u.stopPropagation();
        $("#Logedin-container").fadeIn();
        $("#REDcard-container").fadeOut();
        $("#store-container").fadeOut();
        $(this).attr("tabindex",
            "-1");
        $(this).attr("aria-hidden", "true");
        $("#Header #Logedin-container .closeLogedin a#CloseLogedinPopup").focus()
    });
    $("#CloseLogedinPopup").bind("click", function() {
        $("#OpenLogedinPopup").attr("aria-hidden", "false");
        $("#OpenLogedinPopup").removeAttr("tabindex");
        $("#Logedin-container").fadeOut();
        $(this).parents().find("#OpenLogedinPopup").focus()
    });
    $("#CloseLogedinPopup").bind("keydown", function(u) {
        if (u.shiftKey)
            if (u.keyCode == 9) {
                $("#Header ul#UserMenu li a#OpenLogedinPopup").removeAttr("tabindex");
                $("#Logedin-container").fadeOut();
                $("#OpenLogedinPopup").attr("aria-hidden", "false");
                $("#Header #ShopNavMenu a#OpenStorePopup").focus()
            }
    });
    $("#REDcard-container").bind("mouseleave", function() {
        $("#REDcard-container").fadeOut();
        $("#Header ul#ShopNavMenu li span#.screen-reader-only").text("expand")
    });
    $("#Logedin-container .closeLogedin, #Logedin-container .box").bind("click", function(u) {
        u.stopPropagation()
    });
    $("#CloseREDcardPopup").click(function() {
        $("#REDcard-container").fadeOut()
    });
    $("#REDcard-container .closeREDcard, #REDcard-container .box").click(function(u) {
        u.stopPropagation()
    });
    $(document).click(function() {
        $("#REDcard-container").fadeOut()
    });
    $("#mini-cart-wrapper").mouseenter(function() {
        $("#Header .globalMenuContainer").addClass("changeCartDarkBg");
        $(this).removeClass("no_background");
        $(this).addClass("newmenu_bg");
        $("#Header .mini-cart-arrow").addClass("mini-cart-arrow_mouseenter");
        $("#Header .mini-cart-arrow").removeClass("mini-cart-arrow_mouseleave")
    }).mouseleave(function() {
        $("#Header .globalMenuContainer").removeClass("changeCartDarkBg");
        $(this).removeClass("newmenu_bg");
        $(this).addClass("no_background");
        $("#Header .mini-cart-arrow").removeClass("mini-cart-arrow_mouseenter");
        $("#Header .mini-cart-arrow").addClass("mini-cart-arrow_mouseleave")
    });
    $("#Header form#Search").click(function() {
        $("#searchTerm").focus()
    }).mouseenter(function() {
        $(this).css("width", "605px");
        $("#Header form#Search a#SearchCategories").css("padding-right", "11px")
    }).mouseleave(function() {
        $(this).css("background", "none")
    });
    $("#searchTerm").length > 0 && $("#searchTerm").blur(function() {
        $(this).val() ==
            "search" && $("#searchTerm").val("");
        $("#searchTerm").val().indexOf("search") >= 0 ? $("#searchTerm").css("color", "#666") : $("#searchTerm").css("color", "#333");
        if ($(this).val() == "" || $(this).val().indexOf("search") >= 0) $(this).removeAttr("aria-label")
    }).focus(function() {});
    $(document).click(function() {
        $("#Logedin-container").fadeOut();
        $("#OpenLogedinPopup").removeAttr("tabindex");
        $("#OpenLogedinPopup").attr("aria-hidden", "false")
    })
});
(function(a) {
    function b(c) {
        var e = a(this),
            d = null,
            l = [],
            n = null,
            t = null,
            o = a.extend({
                tgtMenuRowSelector: "> li",
                tgtSubmenuSelector: "*",
                tgtSubmenuDirection: "right",
                tgtMenuTolerance: 75,
                tgtMenuEnter: a.noop,
                tgtMenuExit: a.noop,
                tgtMenuActivate: a.noop,
                tgtMenuDeactivate: a.noop,
                tgtExitMenu: a.noop
            }, c),
            m = function(g) {
                if (g != d) {
                    d && o.tgtMenuDeactivate(d);
                    o.tgtMenuActivate(g);
                    d = g
                }
            },
            h = function(g) {
                var k = f();
                if (k) t = setTimeout(function() {
                    h(g)
                }, k);
                else m(g)
            },
            f = function() {
                function g(v, y) {
                    return (y.y - v.y) / (y.x - v.x)
                }
                if (!d || !a(d).is(o.tgtSubmenuSelector)) return 0;
                var k = e.offset(),
                    q = {
                        x: k.left,
                        y: k.top - o.tgtMenuTolerance
                    },
                    w = {
                        x: k.left + e.outerWidth(),
                        y: q.y
                    },
                    x = {
                        x: k.left,
                        y: k.top + e.outerHeight() + o.tgtMenuTolerance
                    },
                    z = {
                        x: k.left + e.outerWidth(),
                        y: x.y
                    },
                    p = l[l.length - 1],
                    r = l[0];
                if (!p) return 0;
                r || (r = p);
                if (r.x < k.left || r.x > z.x || r.y < k.top || r.y > z.y) return 0;
                if (n && p.x == n.x && p.y == n.y) return 0;
                var u = w;
                k = z;
                if (o.tgtSubmenuDirection == "left") {
                    u = x;
                    k = q
                } else if (o.tgtSubmenuDirection == "below") {
                    u = z;
                    k = x
                } else if (o.tgtSubmenuDirection == "above") {
                    u = q;
                    k = w
                }
                q = g(p, u);
                w = g(p, k);
                u = g(r, u);
                r = g(r, k);
                if (q <
                    u && w > r) {
                    n = p;
                    return 500
                }
                n = null;
                return 0
            };
        e.mouseleave(function() {
            t && clearTimeout(t);
            if (o.tgtExitMenu(this)) {
                d && o.tgtMenuDeactivate(d);
                d = null
            }
        }).find(o.tgtMenuRowSelector).mouseenter(function() {
            t && clearTimeout(t);
            o.tgtMenuEnter(this);
            h(this)
        }).mouseleave(function() {
            o.tgtMenuExit(this)
        }).click(function() {
            m(this)
        });
        a(document).mousemove(function(g) {
            l.push({
                x: g.pageX,
                y: g.pageY
            });
            l.length > 3 && l.shift()
        });
        e.mouseleave(function() {
            a(this).find(".showMenu").removeClass("showMenu");
            d = null
        })
    }
    a.fn.tgtMenu = function(c) {
        this.each(function() {
            b.call(this,
                c)
        });
        return this
    }
})(jQuery);
$(document).ready(function() {
    ajaxComplete()
});

function ajaxComplete() {
    $("#MainMenu").tgtMenu({
        tgtMenuActivate: tgtActivateSubmenu,
        tgtMenuDeactivate: tgtDeactivateSubmenu
    })
}

function tgtActivateSubmenu(a) {
    a = $(a);
    if ($(".showMenu").length == 0) {
        a.addClass("showMenu");
        var b = $("#Header .globalMenuContainer");
        if (a.find(".hover_ie7 > ul").length == 4) b.hasClass("flyout-4-column") || b.addClass("flyout-4-column");
        else b.removeClass("flyout-4-column")
    }
}

function tgtDeactivateSubmenu(a) {
    $(a).removeClass("showMenu")
}
$(document).ready(function() {
    $("body").delegate("#Header .globalMenuContainer ul#MainMenu.gb-menu", "keyup", function(b) {
        if (b.keyCode == "27") {
            if (typeof isGlobalHomePage == "undefined" || isGlobalHomePage == false) {
                b.preventDefault();
                $(this).parents().find("li.leftmenu.showMenu span a").focus();
                if (!$("#Header .globalMenuContainer .active ul#MainMenu.gb-menu li").hasClass("showMenu"))
                    if ($("#Header .globalMenuContainer .menuBox").hasClass("active")) {
                        $("#Header .globalMenuContainer .menuBox").removeClass("active");
                        $("#Header a.triggerHover span.screen-reader-only").html("&nbsp;expand");
                        $("#Header .globalMenuContainer .menuBox a.triggerHover").focus()
                    }
            }
            setTimeout(function() {
                $("li.leftmenu").removeClass("showMenu")
            }, 100);
            $("li.leftmenu.showMenu span:first a").focus()
        }
    });
    $("#REDcard-container").keyup(function(b) {
        if (b.keyCode == "27") {
            b.preventDefault();
            $("#REDcard-container").fadeOut();
            $("#OpenREDcardPopup").focus();
            $("#OpenREDcardPopup").removeAttr("tabindex");
            $("#OpenREDcardPopup").attr("aria-hidden", "false");
            $("#Header ul#UserMenu li a.signinTitle").attr("aria-hidden", "false")
        }
    });
    $("#Logedin-container").keyup(function(b) {
        if (b.keyCode == "27") {
            b.preventDefault();
            $("#Logedin-container").fadeOut();
            $("#OpenLogedinPopup").attr("aria-hidden", "false");
            $("#Header ul#UserMenu li a.signinTitle").attr("aria-hidden", "false");
            $("#OpenLogedinPopup").removeAttr("tabindex");
            $("#OpenLogedinPopup").focus()
        }
    });
    $("body").delegate("a.triggerHover", "click", function(b) {
        if (typeof isGlobalHomePage == "undefined" || isGlobalHomePage == false) {
            b.preventDefault();
            $("#Header .globalMenuContainer .menuBox").hasClass("active") ?
                $("#Header a.triggerHover span.screen-reader-only").html("&nbsp;Collapse") : $("#Header a.triggerHover span.screen-reader-only").html("&nbsp;expand")
        }
    });
    $("#Header #Logedin-container").bind("keyup", function(b) {
        if (b.keyCode == "27") {
            $("#Header ul#UserMenu li a#OpenLogedinPopup").removeAttr("tabindex");
            $("#Header ul#UserMenu li a#OpenLogedinPopup").attr("aria-hidden", "false");
            $("#Header ul#UserMenu li a#OpenLogedinPopup").focus()
        }
    });
    if ($("#searchTerm").length > 0) {
        $("#searchTerm").val().indexOf("search") >=
            0 ? $("#searchTerm").css("color", "#666") : $("#searchTerm").css("color", "#333");
        $("#searchTerm").bind("focus, blur, keydown", function() {
            $("#searchTerm").val().indexOf("search") >= 0 ? $("#searchTerm").css("color", "#666") : $("#searchTerm").css("color", "#333")
        })
    }
    $("#Header ul#MainMenu.gb-menu li").bind("mouseleave, mouseenter", function() {
        $("#Header ul#MainMenu.gb-menu li.showMenu .hover .hover_ie7 > ul").each(function() {
            $(this).find("li").each(function() {
                $(this).addClass("noSubMenu");
                $(this).find("ul").each(function() {
                    $(this).parent("li").removeClass("noSubMenu")
                });
                $(this).find("a").each(function() {
                    var b = $(this).css("font-weight").toString(),
                        c = $(this).css("font-size").toString();
                    (b == "700" || b == "bold") && (c == "14px" || c == "15px") || $(this).parent("li").removeClass("noSubMenu")
                })
            })
        })
    });
    $("#Header").delegate("ul#MainMenu.gb-menu>li", "click", function(b) {
        if (b.target.className == "flyoutClose") {
            $(this).removeClass("showMenu");
            $(this).children().find("a").focus();
            return false
        }
    });
    $("#Header #Logedin-container p a.signinClose").bind("click", function(b) {
        b.preventDefault();
        $("#Logedin-container").fadeOut();
        $("#OpenLogedinPopup").attr("aria-hidden", "false");
        $("#Header ul#UserMenu li a.signinTitle").attr("aria-hidden", "false");
        $("#Header ul#UserMenu li a#OpenLogedinPopup").removeAttr("tabindex");
        b = $(this).parents().find("#OpenLogedinPopup").text();
        $(this).parents().find("#OpenLogedinPopup").attr("aria-label", b);
        $(this).parents().find("#OpenLogedinPopup").focus()
    });
    $(".signinClose").bind("click keydown", function(b) {
        if (!b.shiftKey)
            if (b.keyCode == 9) {
                $("#Header ul#UserMenu li a#OpenLogedinPopup").removeAttr("tabindex");
                $("#Logedin-container").fadeOut();
                $("#OpenLogedinPopup").attr("aria-hidden", "false");
                $("#Header #ShopNavMenu .findStore").css("display") == "block" && $(this).find("#Header #ShopNavMenu span.findStore a").focus()
            }
    });
    $(".REDcardClose").bind("keydown", function(b) {
        if (!b.shiftKey)
            if (b.keyCode == 9) {
                $("#REDcard-container").fadeOut();
                $("#Header ul#ShopNavMenu li a#OpenREDcardPopup").removeAttr("tabindex");
                $("#Header ul#ShopNavMenu li a#OpenREDcardPopup").attr("aria-hidden", "false");
                $("#OpenLogedinPopup").attr("aria-hidden",
                    "false");
                $("#globalPromise").focus()
            }
    });
    $("#Header #REDcard-container p a.REDcardClose").bind("click", function(b) {
        $("#REDcard-container").fadeOut();
        $("#Header ul#ShopNavMenu li a#OpenREDcardPopup").attr("tabindex", "0");
        $("#Header ul#ShopNavMenu li a.signinTitle").attr("aria-hidden", "false");
        $("#OpenLogedinPopup").attr("aria-hidden", "false");
        $("#OpenLogedinPopup").removeAttr("tabindex");
        b.preventDefault();
        $(this).parents().find("#OpenREDcardPopup").attr("aria-label", "redcard expand");
        $(this).parents().find("#OpenREDcardPopup").focus()
    });
    $("#Header ul#UserMenu li a#OpenLoginPopup").bind("click", function() {
        if ($("#Header ul#UserMenu li a span.screen-reader-only").text() == "expand") {
            $("#Header ul#UserMenu li a span.screen-reader-only").text("collapse");
            $("#Header ul#UserMenu li a.signinTitle").attr("aria-hidden", "true")
        }
    });
    $("#Header #Login-container div.closeLogin").bind("click", function() {
        if ($("#Header ul#UserMenu li a span.screen-reader-only").text() == "collapse") {
            $("#Header ul#UserMenu li a span.screen-reader-only").text("expand");
            $("#Header ul#UserMenu li a.signinTitle").attr("aria-hidden", "false")
        }
    });
    $("#Header ul#ShopNavMenu li a#CloseREDcardPopup").bind("click", function() {
        $("#OpenREDcardPopup").attr("aria-hidden", "true");
        $("#Header ul#ShopNavMenu li a.signinTitle").attr("aria-hidden", "false");
        $("#Header ul#ShopNavMenu li a#OpenREDcardPopup").attr("tabindex", "0");
        $("#Header ul#ShopNavMenu li a span.screen-reader-only").text("expand");
        $("#Header ul#ShopNavMenu li a#OpenREDcardPopup").focus()
    });
    $("#Header ul#ShopNavMenu li a#CloseREDcardPopup").bind("keydown",
        function(b) {
            if (b.shiftKey)
                if (b.keyCode == 9) {
                    $("#REDcard-container").fadeOut();
                    $("#Header ul#ShopNavMenu li a#OpenREDcardPopup").removeAttr("tabindex");
                    $("#Header ul#ShopNavMenu li a#OpenREDcardPopup").attr("aria-hidden", "false");
                    $("#OpenLogedinPopup").attr("aria-hidden", "false")
                }
        });
    if ($("#Header .globalMenuContainer ul#MainMenu.gb-menu").length > 0) {
        $(".leftmenu").size();
        var a = 490 / $(".leftmenu").size();
        a -= 2;
        $(".leftmenu").height(a)
    }
});
$(document).ready(function() {
    var a = "N",
        b = Target.controller.header.cookie.read("guestDisplayName");
    if (typeof b != undefined && b != null && b != "") {
        b = b.split("|");
        if (b.length > 0)
            for (i in b)
                if (b[i] == "RC=Y") {
                    a = "Y";
                    break
                }
    }
    var c = [];
    if ($("#hotspotContent")) {
        $("#hotspotContent > div").each(function(l, n) {
            var t = $(n).html();
            if ($.trim(t) != "")
                if (a == "Y") l != 0 && c.push($(n).html());
                else c.push($(n).html())
        });
        if (c.length > 0 && $("#globalPromise")) {
            b = Math.random ? Math.round(Math.random() * (c.length - 1)) : 1;
            $("#globalPromise").html(c[b])
        }
    }
    b =
        true;
    var e = window.location.pathname;
    if (e && (e.indexOf("/bp/") != -1 || e.indexOf("/redcard/") != -1)) b = false;
    if ($("#shipping_ribbon") && b) {
        var d = "";
        $("#shipping_ribbon") && $("#shipping_ribbon").contents().each(function() {
            if (this.nodeType == 8) $(this).remove();
            else if ($(this).html() != null) d += $(this).html()
        });
        if ($.trim(d) != "") {
            $("#Header").css("height", "148px");
           // $("#shipping_ribbon").show()
        } else {
            $("#Header").css("height", "115px");
            $("#shipping_ribbon").hide()
        }
    } else {
        $("#Header").css("height", "115px");
        $("#shipping_ribbon").hide()
    }
});