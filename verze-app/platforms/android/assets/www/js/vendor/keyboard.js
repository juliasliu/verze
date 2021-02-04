
var isShift = false,
capsLock = false,
isNumSymbols = false,
isMoreSymbols = false;

var kbdMode = ["lowercase", "uppercase", "numbers", "symbols"];

/* typing */
for (var i = 0; i < kbdMode.length; ++i) {
	$("#" + kbdMode[i] + " .row .white:not(:last)").mousedown(function(){
		$("textarea").append($(this).find("span").html().substring(0,1));
		$(this).find(".popout").css("display", "block");
		$(this).find(".popout .head").html($(this).find("span").html().substring(0,1));
		$(this).find("span").css("color", "transparent");
	});
	$("#" + kbdMode[i] + " .row .white:last").mousedown(function(){
		$("textarea").append("&#32;");
	});
}
$(".white").mouseup(function(){
	$(this).find(".popout").css("display", "none");
	$(this).find(".popout .head").html("");
	$(this).find("span").css("color", "#000");
	if (isShift == true && capsLock == false) {
		$("#lowercase").css("display", "block");
		$("#uppercase").css("display", "none");
		isShift = false;
	}
});

/* toggle shift */
//lowercase to uppercase
$("#lowercase .row:eq(2) .gray:eq(0)").click(function(){
	if (isShift == false) {
		$("#lowercase").css("display", "none");
		$("#uppercase").css("display", "block");
		isShift = true;
	}
});
//uppercase to lowercase
$("#uppercase .row:eq(2) .gray:eq(0)").click(function(){
	if (isShift == true) {
		$("#lowercase").css("display", "block");
		$("#uppercase").css("display", "none");
		isShift = false;
	}
});
//caps lock on
$("#uppercase .row:eq(2) .gray:eq(0)").dblclick(function(){
	if (capsLock == false) {
		$("#lowercase").css("display", "none");
		$("#uppercase").css("display", "block");
		$(this).children("span").html("&#8682;");
		capsLock = true;
	}
});
//caps lock off
$("#uppercase .row:eq(2) .gray:eq(0)").click(function(){
	if (capsLock == true) {
		$("#lowercase").css("display", "block");
		$("#uppercase").css("display", "none");
		$(this).children("span").html("&#11014;");
		capsLock = false;
	}
});

/* backspace */
var backspace = function(){
	$("textarea").html($("textarea").html().substring(0,$("textarea").html().length-1));
};
for (var j = 0; j < kbdMode.length; ++j) {
	$("#" + kbdMode[j] + " .row:eq(2) .key:last").click(backspace);
};

/* toggle numbers */
//lowercase/uppercase to numbers
for (var k = 0; k < kbdMode.length-2; ++k) {
	$("#" + kbdMode[k] + " .row:eq(3) .gray:eq(0)").click(function(){
		if (isNumSymbols == false) {
			$("#numbers").css("display", "inherit");
			$("#lowercase").css("display", "none");
			$("#uppercase").css("display", "none");
			$("#uppercase .row:eq(2) .gray:eq(0)").children("span").html("&#11014;");
			isNumSymbols = true;
			isShift = false;
			capsLock = false;
		}
	});
}
//numbers to lowercase
$("#numbers .row:eq(3) .gray:eq(0)").click(function(){
	if (isNumSymbols == true) {
		$("#numbers").css("display", "none");
		$("#lowercase").css("display", "block");
		isNumSymbols = false;
	}
});

/* toggle symbols */
//numbers to symbols
$("#numbers .row:eq(2) .gray:eq(0)").click(function(){
	if (isMoreSymbols == false) {
		$("#numbers").css("display", "none");
		$("#symbols").css("display", "block");
		isMoreSymbols = true;
	}
});
//symbols to numbers
$("#symbols .row:eq(2) .gray:eq(0)").click(function(){
	if (isMoreSymbols == true) {
		$("#numbers").css("display", "block");
		$("#symbols").css("display", "none");
		isMoreSymbols = false;
	}
});
//symbols to lowercase
$("#symbols .row:eq(3) .gray:eq(0)").click(function(){
	if (isMoreSymbols == true) {
		$("#lowercase").css("display", "block");
		$("#symbols").css("display", "none");
		isMoreSymbols = false;
	}
});

/* return (line break) */
for (var l = 0; l < kbdMode.length; ++l) {
	$("#" + kbdMode[l] + " .row:eq(3) .gray:eq(1)").click(function(){
		$("textarea").append("&#10;");
	});
}