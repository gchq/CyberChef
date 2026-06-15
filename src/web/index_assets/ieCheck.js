// Must be text/javascript rather than application/javascript otherwise IE won't recognise it...
if (navigator.userAgent && navigator.userAgent.match(/Trident/)) {
    document.getElementById("notice").innerHTML += "Internet Explorer is not supported, please use Firefox or Chrome instead";
    alert("Internet Explorer is not supported, please use Firefox or Chrome instead");
}
