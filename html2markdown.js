var convertToMarkdown = function (htmlString) { //slightly modified version of http://codereview.stackexchange.com/a/101843/41415
    htmlString = htmlString.replace(/<(\/)?(div|p)>/gi, ''); //remove <div>'s and <p>'s
    var doc = new DOMParser().parseFromString(htmlString, 'text/html');

    for (var tag in conversions) {
        var els = Array.prototype.slice.call(doc.body.getElementsByTagName(tag.toLowerCase()));
        var length = els.length;
        for (var i = 0; i < length; i++) {
            var curEl = els[i];
            if (curEl.childNodes.length > 1) {
                curEl.innerHTML = convertToMarkdown(curEl.innerHTML);
            }
            curEl.parentNode.replaceChild(document.createTextNode(conversions[tag](curEl)), curEl);
        }
    }
    return doc.body.innerHTML.replace(/&gt;/g, ">").replace(/&lt;/g, "<").replace(/&nbsp;/g, " ");
};

var newline = '\n\n';

var conversions = {
    br: function (data) {
        return newline;
    },
    h1: function (data) {
        return '# ' + data.innerHTML + newline;
    },
    h2: function (data) {
        return '## ' + data.innerHTML + newline;
    },
    h3: function (data) {
        return '### ' + data.innerHTML + newline;
    },
    hr: function (data) {
        return '---' + newline;
    },
    blockquote: function (data) {
        var classes = window.getSelection().anchorNode.parentNode.classList;
        var isSpoiler = (Array.prototype.slice.call(classes).indexOf('spoiler') > -1 ? true : false);
        if (isSpoiler) {
            return '>! ' + data.innerHTML + newline;
        } else {
            return '> ' + data.innerHTML + newline;
        }
    },
    img: function (data) {
        return imgStr = "![alt text](" + data.src + ")";
    },
    a: function (data) {
        return "[" + data.innerHTML + "](" + data.getAttribute('href') + ")";
    },
    ul: function (data) {
        var lis = data.childNodes;
        var newmd = '';
        var lislength = lis.length;
        for (var x = 0; x < lislength; x++) {
            newmd += "- " + lis[x].innerHTML + "\n";
        }
        return newmd;
    },
    ol: function (data) {
        var lis = data.childNodes;
        var counter = 1;
        var newmd = '';
        var lislength = lis.length;
        for (var x = 0; x < lislength; x++) {
            newmd += counter + ". " + lis[x].innerHTML + newline;
            counter++;
        }
        return newmd;
    },
    strong: function (data) {
        return "**" + data.innerHTML + "**";
    },
    b: function (data) {
        return "**" + data.innerHTML + "**";
    },
    i: function (data) {
        return "*" + data.innerHTML + "*";
    },
    pre: function (data) {
        var x = data.innerHTML.split('\n');
        var newtext = '';
        for (var i = 0; i < x.length; i++) {
            newtext += '    ' + x[i] + '\n';
        }
        return newtext;
    },
    code: function (data) {
        if (data.parentNode.tagName != 'PRE') {
            return '``' + data.innerHTML.replace(/\r|\n/g, '').replace(/^\s*(.*)\s*$/, '$1') + '``';
        } else {
            this.pre(data);
        }
    }
};

//test case:

//console.log(convertToMarkdown('<h1>this is h1</h1><h2>this is h2</h2><h3>this is h3</h3><div><hr id="null"></div><div><br></div><blockquote>blockquote</blockquote><div><blockquote class='spoiler'>spoiler</blockquote></div><div><ul><li>unordered list</li></ul></div><div><ol><li>ordered list</li></ol></div><div><br></div><div><b>bold</b></div><div><br></div><div><i>italic</i></div><div><br></div><div><img src="http://placehold.it/200x200"></div><div><br></div><div><a href="http://google.com">link</a></div><div><br></div><div><pre>pre</pre></div><div><br></div><div><code>code</code></div>'));
