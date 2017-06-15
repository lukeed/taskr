(function() {
  var food, foods, i, len, list;

  list = ["foo", "bar"];

  foods = ["broccoli", "spinach", "chocolate"];

  for (i = 0, len = foods.length; i < len; i++) {
    food = foods[i];
    if (food !== "chocolate") {
      eat(food);
    }
  }

}).call(this);
