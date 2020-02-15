$(document).ready(function(){
    // Reset state of calculator before we begin
    let evalText = "";
    $("#display-old-text").hide();
    $("#display-text").css("font-size", "30px");

    // Non-special button (ones that should be written to display) actions
    $(".nonspecial").click(function(){
        let currentText = $("#display-text").html();
        let currButtonText = $(this).html();

        // If 0 is shown, allow operations on it
        if($(this).hasClass("ops") && currentText === "0") {
            $("#display-text").append(currButtonText);
            evalText = "0" + $(this).attr("data-value");
        } else {
            // Overwrite unusable contents of the screen and shorten text
            if (currentText === "0" || currentText === "ERROR" || currentText === "Infinity") {
                $("#display-text").html(currButtonText);
                evalText = $(this).attr("data-value");
            } else if (currentText.length < 25) {
                $("#display-text").append(currButtonText);
                evalText += $(this).attr("data-value");
            }
        }
    });

    // Clear (C) button action
    $("#cBtn").click(function(){
        $("#display-old-text").html("");
        $("#display-text").html("0");
        evalText = 0;
        $("#display-old-text").hide();
        $("#display-text").css("font-size", "30px");
    });

    // Clear entry (CE) button function
    $("#ceBtn").click(function(){
        evalText = evalText.substring(0, evalText.length - 1);
        if (evalText === "" || evalText === "ERRO" || evalText === "Infinit") {
            evalText = 0;
        }
        $("#display-text").html(evalText);
    });

    // Equal (=) button action
    $("#equalBtn").click(function(){
        let result = "Something went reallyyyy wrong"; // should never be shown

        // evaluate the expression
        try {
            result = eval(evalText);
        } catch {
            result = "ERROR"
        }

        // place calculation above as "history"
        $("#display-old-text").css("color", "grey");
        $("#display-old-text").html(evalText.replace(/\*/gi, "x") + " = " + result);
        $("#display-old-text").show();

        // set the result font to be smaller
        $("#display-text").css("font-size", "20px");

        // display the result
        $("#display-text").html(result);
        evalText = result.toString();
    });
  });