// ==UserScript==
// @name         Stack Exchange WYSIWYG Editor
// @namespace    http://stackexchange.com/users/4337810/
// @version      0.1 ALPHA
// @description  Adds a WYSIWYG Editor to the Stack Exchange sites
// @author       ᔕᖺᘎᕊ (http://stackexchange.com/users/4337810/)
// @match        *://*.stackexchange.com/*
// @match        *://*.stackoverflow.com/*
// @match        *://*.superuser.com/*
// @match        *://*.serverfault.com/*
// @match        *://*.askubuntu.com/*
// @match        *://*.stackapps.com/*
// @match        *://*.mathoverflow.net/*
// @grant        none
// ==/UserScript==

//NOTE: The following features are unstable/not working at all:
// - Keyboard shortcuts
// - <code> tags

$('head').append("<script src='https://cdn.rawgit.com/shu8/SE-WYSIWYG-Editor/master/html2markdown.js'></script>");
//$('head').append("<script src='https://cdn.rawgit.com/jeresig/jquery.hotkeys/master/jquery.hotkeys.js'></script>");
$('head').append("<link rel='stylesheet' type='text/css' href='https://rawgit.com/shu8/SE-WYSIWYG-Editor/master/style.css'>");

$('body').append("<div id='changeLink'><span style='float:left;cursor:pointer' id='closeChangeLink'>x</span><br>"+
        "Link:"+
        "<input type='url' id='newUrl'><br>"+
    "</div>");

$('#post-editor').after("<div id='toolbar'>" +
"        <a href='javascript:void(0);' style='background-position: -160px 0px;' class='wysiwygBtn' id='h123' title='h1/h2/h3 (ctrl+h)'></a>" +
"        <a href='javascript:void(0);' style='background-position: -180px 0px;' class='wysiwygBtn' data-command='insertHorizontalRule' id='hr' title='hr (alt+h)'></a>" +
"        <a href='javascript:void(0);' style='background-position: -60px 0px;' class='wysiwygBtn' id='blsp' title='blockquote/spoiler (alt+b)'></a>" +
"        <a href='javascript:void(0);' style='background-position: -140px 0px;' class='wysiwygBtn' data-command='insertUnorderedList' id='unordered' title='unordered list (ctrl+u)'></a>" +
"        <a href='javascript:void(0);' style='background-position: -120px 0px;' class='wysiwygBtn' data-command='insertOrderedList' id='ordered' title='ordered list (ctrl+o)'></a>" +
"        <a href='javascript:void(0);' style='background-position: 0px 0px;' class='wysiwygBtn' data-command='bold' id='bold' title='bold (ctrl+b)'></a>" +
"        <a href='javascript:void(0);' style='background-position: -20px 0px;' class='wysiwygBtn' data-command='italic' id='italic' title='italic (ctrl+i)'></a>" +
"        <a href='javascript:void(0);' style='background-position: -100px 0px;' class='wysiwygBtn' id='image' title='image (alt+i)'></a>" +
"        <a href='javascript:void(0);' style='background-position: -40px 0px;' class='wysiwygBtn' id='link' title='link (ctrl+l)'></a>" +
"        <a href='javascript:void(0);' style='background-position: -80px 0px;' class='wysiwygBtn' id='pre' title='pre (alt+p)'></a>" +
"        <a href='javascript:void(0);' style='background-position: -80px 0px;' class='wysiwygBtn' id='code' title='code (alt+c) EXPERIMENTAL'></a>" +
"    </div>" +
"    <br>" +
"    <div id='wysiwyg' contenteditable='true'></div>" +
"    <br>" +
"    <button id='submit'>submit</button>");

function formatBlock(extra) {
    document.execCommand('formatBlock', false, extra);
}

function surround(tag) {
    document.execCommand('insertHTML', false, '<' + tag + '>' + document.getSelection().toString() + '</' + tag + '>');
}

var btnHandlers = {
    link: function (d) {
        var url = window.prompt('URL:');
        if (!url) return false;
        document.execCommand('createLink', false, url);
        if (d) d.e.stopPropagation();
    },
    image: function (d) {
        var url = window.prompt('URL:');
        if (!url) return false;
        document.execCommand('insertImage', false, url);
        if (d) d.e.stopPropagation();
    },
    pre: function (d) {
        surround('pre');
        if (d) d.e.stopPropagation();
    },
    code: function (d) {
        surround('code');
        if (d) d.e.stopPropagation();
    },
    h123: function (d) {
        var currentTag = window.getSelection().anchorNode.parentNode.tagName.toLowerCase();
        if (currentTag == 'h1') {
            formatBlock('h2'); //h1 -> h2
        } else if (currentTag == 'h2') {
            formatBlock('h3'); //h2 -> h3
        } else if (currentTag == 'h3') {
            formatBlock('p'); //h3 -> p
        } else {
            formatBlock('h1'); //nothing -> h1
        }
        if (d) d.e.stopPropagation();
    },
    blsp: function (d) {
        var classes = window.getSelection().anchorNode.parentNode.classList,
            currentTag = window.getSelection().anchorNode.parentNode.tagName.toLowerCase(),
            isSpoiler = (Array.prototype.slice.call(classes).indexOf('spoiler') > -1 ? true : false),
            isBlockquote = (currentTag == 'blockquote' ? true : false);

        if (isSpoiler) {
            formatBlock('p'); //if it's already a spoiler, remove all formatting
        } else if (isBlockquote) {
            var block = window.getSelection().focusNode.parentNode;
            block.className += ' spoiler'; //if it's already a blockquote, make it a spoiler
        } else {
            formatBlock('blockquote'); //if it's nothing, make it a blockquote
        }
        if (d) d.e.stopPropagation();
    },
    other: function (d) {
        document.execCommand(d.t.data('command'), false, (d.t.data('extra') ? d.t.data('extra') : null));
    }
};

$(function () {
    $('.wysiwygBtn').click(function (e) {
        var html = document.getElementById('wysiwyg').innerHTML;

        (btnHandlers[this.id] || btnHandlers['other'])({
            e: e,
            t: $(this)
        });

        if (html == document.getElementById('wysiwyg').innerHTML) { //if nothing changed, unformat!
            formatBlock('p');
        }
    });

    $('#wysiwyg').on('click', 'a', function (e) {
        var node = window.getSelection().anchorNode.parentNode;
        console.log(node);
        $('#changeLink input').val(node.href);
        $('#changeLink').append("<a href='" + node.href + "' target='_blank'>open in new tab</a>");
        $('#changeLink').css({
            top: $(node).offset().top + 20,
            left: $(node).offset().left
        }).show();
        $('#changeLink').on('change keydown paste input', 'input', function () {
            node.href = $(this).val();
        });
    });

    $('#closeChangeLink').click(function () {
        $('#changeLink input').val('');
        $('#changeLink').find('a').remove();
        $('#changeLink').hide();
    });
/*    $('#wysiwyg').bind('keydown', 'ctrl+h', function (e) {
        e.preventDefault();
        btnHandlers['h123']();
    });
    $('#wysiwyg').bind('keydown', 'alt+h', function (e) {
        e.preventDefault();
        $('#hr').trigger('click');
    });
    $('#wysiwyg').bind('keydown', 'alt+b', function (e) {
        e.preventDefault();
        btnHandlers['blsp']();
    });
    $('#wysiwyg').bind('keydown', 'ctrl+u', function (e) {
        e.preventDefault();
        $('#unordered').trigger('click');
    });
    $('#wysiwyg').bind('keydown', 'ctrl+o', function (e) {
        e.preventDefault();
        $('#ordered').trigger('click');
    });
    $('#wysiwyg').bind('keydown', 'ctrl+b', function (e) {
        e.preventDefault();
        $('#bold').trigger('click');
    });
    $('#wysiwyg').bind('keydown', 'ctrl+i', function (e) {
        e.preventDefault();
        $('#italic').trigger('click');
    });
    $('#wysiwyg').bind('keydown', 'alt+i', function (e) {
        e.preventDefault();
        btnHandlers['image']();
    });
    $('#wysiwyg').bind('keydown', 'ctrl+l', function (e) {
        e.preventDefault();
        btnHandlers['link']();
    });
    $('#wysiwyg').bind('keydown', 'alt+p', function (e) {
        e.preventDefault();
        btnHandlers['pre']();
    });
    $('#wysiwyg').bind('keydown', 'alt+c', function (e) {
        e.preventDefault();
        btnHandlers['code']();
    });*/
});

$(document).on('click', '#submit', function () {
    var converted = convertToMarkdown(document.getElementById('wysiwyg').innerHTML);
    $('#wmd-input:last').text(converted);
    console.log(converted);
});
