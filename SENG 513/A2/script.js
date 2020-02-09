$(document).ready(function(){
    let evalText = "";
    $("#display-old-text").hide();
    $("#display-text").css("font-size", "30px");

    // Non-special button actions
    $(".nonspecial").click(function(){
        let currentText = $("#display-text").html();
        let x = $(this).html();

        if (currentText === "0" || currentText === "ERROR" || currentText === "Infinity") {
            $("#display-text").html(x);
            evalText = $(this).attr("data-value");
        } else if (currentText.length < 25) {
            $("#display-text").append(x);
            evalText += $(this).attr("data-value");
        }
    });

    // Clear button action
    $("#cBtn").click(function(){
        $("#display-old-text").html("");
        $("#display-text").html("");
        evalText = "";
        $("#display-old-text").hide();
        $("#display-text").css("font-size", "30px");
    });

    // Clear entry button function
    $("#ceBtn").click(function(){
        evalText = evalText.substring(0, evalText.length - 1);
        if (evalText === "" || evalText === "ERRO" || evalText === "Infinit") {
            evalText = 0;
        }
        $("#display-text").html(evalText);
    });

    // Equal button action
    $("#equalBtn").click(function(){
        console.log(evalText.length);
        let result = "Something went reallyyyy wrong";
        try {
            result = eval(evalText);
        } catch {
            result = "ERROR"
        }
        $("#display-old-text").css("color", "grey");
        $("#display-old-text").html(evalText.replace(/\*/gi, "x") + " = " + result);
        $("#display-old-text").show();
        $("#display-text").css("font-size", "20px");
        $("#display-text").html(result);
        evalText = result.toString();
    });
  });