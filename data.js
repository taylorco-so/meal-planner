// ---------- ingredient categories ----------
var MASTER_CAT = {
  "Banana":"Produce", "Bell pepper":"Produce", "Yellow onion":"Produce", "Cucumber":"Produce",
  "Cherry tomatoes":"Produce", "Russet potato":"Produce", "Carrot":"Produce", "Lime":"Produce",
  "Green beans":"Produce", "Garlic":"Produce",
  "Spinach":"Produce", "Zucchini":"Produce", "Mushrooms":"Produce", "Apple":"Produce",
  "Sweet potato":"Produce", "Cabbage":"Produce",
  "Eggs":"Protein", "Canned black beans":"Protein", "Chicken thighs":"Protein", "Canned tuna":"Protein",
  "Deli ham":"Protein", "Smoked sausage":"Protein", "Ground beef":"Protein", "Canned kidney beans":"Protein",
  "Pork chops":"Protein", "Pork shoulder":"Protein", "Bacon":"Protein", "Canned white beans":"Protein",
  "Ground turkey":"Protein", "Canned salmon":"Protein", "Canned lentils":"Protein", "Canned chickpeas":"Protein",
  "Milk":"Dairy", "Butter":"Dairy", "Plain yogurt":"Dairy", "Shredded cheese":"Dairy", "Sour cream":"Dairy",
  "Cottage cheese":"Dairy", "Cream cheese":"Dairy",
  "Rolled oats":"Pantry & Grains", "Honey":"Pantry & Grains", "Peanut butter":"Pantry & Grains",
  "Granola":"Pantry & Grains", "Flour tortillas":"Pantry & Grains", "Salsa":"Pantry & Grains",
  "Flour":"Pantry & Grains", "Rice":"Pantry & Grains", "Canned tomato soup":"Pantry & Grains",
  "Short pasta":"Pantry & Grains", "Italian dressing":"Pantry & Grains", "Mayonnaise":"Pantry & Grains",
  "Chicken broth":"Pantry & Grains", "Soy sauce":"Pantry & Grains", "Olive oil":"Pantry & Grains",
  "Spaghetti":"Pantry & Grains", "Marinara sauce":"Pantry & Grains", "Corn tortillas":"Pantry & Grains",
  "Canned diced tomatoes":"Pantry & Grains", "Chili powder":"Pantry & Grains", "BBQ sauce":"Pantry & Grains",
  "Hamburger buns":"Pantry & Grains", "Sandwich bread":"Pantry & Grains",
  "Quinoa":"Pantry & Grains", "English muffins":"Pantry & Grains", "Pita bread":"Pantry & Grains", "Hummus":"Pantry & Grains",
  "Frozen mixed berries":"Frozen", "Frozen corn":"Frozen", "Frozen mixed vegetables":"Frozen", "Frozen broccoli":"Frozen"
};
var CAT_ORDER = ["Produce","Protein","Dairy","Pantry & Grains","Frozen"];

// ---------- estimated cost per typical single-recipe use ----------
// Grounded in Sept 2026 U.S. average retail prices (BLS/FRED, e.g. eggs $2.19/doz,
// ground beef $6.88/lb, chicken breast ~$4.15/lb, milk $4.31/gal, cheddar $5.74/lb,
// butter $3.92/lb, rice $1.11/lb, spaghetti $1.37/lb; ground turkey ~$5.50/lb, canned
// salmon ~$2.27/5oz can, canned chickpeas ~$0.99/can, quinoa ~$3.50/lb, sweet potato
// ~$1.00/lb) scaled to the amount a home recipe typically uses. These are estimates
// for budgeting, not a receipt.
var COST_PER_USE = {
  "Banana": 0.22, "Bell pepper": 0.95, "Yellow onion": 0.35, "Cucumber": 0.70,
  "Cherry tomatoes": 2.50, "Russet potato": 1.30, "Carrot": 0.55, "Lime": 0.35,
  "Green beans": 1.80, "Garlic": 0.30,
  "Spinach": 1.00, "Zucchini": 0.80, "Mushrooms": 1.25, "Apple": 0.35,
  "Sweet potato": 1.00, "Cabbage": 0.90,
  "Eggs": 0.55, "Canned black beans": 1.20, "Chicken thighs": 2.90, "Canned tuna": 1.60,
  "Deli ham": 3.00, "Smoked sausage": 4.00, "Ground beef": 6.20, "Canned kidney beans": 1.20,
  "Pork chops": 5.50, "Pork shoulder": 7.50, "Bacon": 1.90, "Canned white beans": 1.20,
  "Ground turkey": 5.50, "Canned salmon": 2.30, "Canned lentils": 1.30, "Canned chickpeas": 1.00,
  "Milk": 1.00, "Butter": 0.40, "Plain yogurt": 1.60, "Shredded cheese": 2.40, "Sour cream": 1.20,
  "Cottage cheese": 2.20, "Cream cheese": 0.45,
  "Rolled oats": 0.50, "Honey": 0.40, "Peanut butter": 0.70,
  "Granola": 1.50, "Flour tortillas": 2.20, "Salsa": 1.20,
  "Flour": 0.30, "Rice": 0.80, "Canned tomato soup": 1.80,
  "Short pasta": 1.55, "Italian dressing": 0.60, "Mayonnaise": 0.40,
  "Chicken broth": 1.50, "Soy sauce": 0.20, "Olive oil": 0.35,
  "Spaghetti": 1.40, "Marinara sauce": 1.90, "Corn tortillas": 1.80,
  "Canned diced tomatoes": 1.30, "Chili powder": 0.15, "BBQ sauce": 0.60,
  "Hamburger buns": 2.50, "Sandwich bread": 2.20,
  "Quinoa": 0.60, "English muffins": 1.60, "Pita bread": 1.80, "Hummus": 1.00,
  "Frozen mixed berries": 3.50, "Frozen corn": 1.60, "Frozen mixed vegetables": 1.80, "Frozen broccoli": 1.80
};

// ---------- typical amount used per single recipe use ----------
// unit "ct" = a bare count of whole items (e.g. 2 bananas). Like COST_PER_USE,
// these are reasonable per-use planning amounts, not exact recipe measurements.
var QTY_PER_USE = {
  "Banana": {amt:2, unit:"ct"}, "Bell pepper": {amt:1, unit:"ct"}, "Yellow onion": {amt:1, unit:"ct"},
  "Cucumber": {amt:1, unit:"ct"}, "Cherry tomatoes": {amt:1, unit:"cup"}, "Russet potato": {amt:1, unit:"lb"},
  "Carrot": {amt:2, unit:"ct"}, "Lime": {amt:1, unit:"ct"}, "Green beans": {amt:0.5, unit:"lb"},
  "Garlic": {amt:2, unit:"clove"},
  "Spinach": {amt:2, unit:"cup"}, "Zucchini": {amt:1, unit:"ct"}, "Mushrooms": {amt:1, unit:"cup"},
  "Apple": {amt:1, unit:"ct"}, "Sweet potato": {amt:1, unit:"lb"}, "Cabbage": {amt:2, unit:"cup"},
  "Eggs": {amt:3, unit:"ct"}, "Canned black beans": {amt:1, unit:"can"}, "Chicken thighs": {amt:1.25, unit:"lb"},
  "Canned tuna": {amt:1, unit:"can"}, "Deli ham": {amt:0.25, unit:"lb"}, "Smoked sausage": {amt:1, unit:"package"},
  "Ground beef": {amt:1, unit:"lb"}, "Canned kidney beans": {amt:1, unit:"can"}, "Pork chops": {amt:1, unit:"lb"},
  "Pork shoulder": {amt:2, unit:"lb"}, "Bacon": {amt:4, unit:"slice"}, "Canned white beans": {amt:1, unit:"can"},
  "Ground turkey": {amt:1, unit:"lb"}, "Canned salmon": {amt:1, unit:"can"}, "Canned lentils": {amt:1, unit:"can"},
  "Canned chickpeas": {amt:1, unit:"can"},
  "Milk": {amt:1, unit:"cup"}, "Butter": {amt:2, unit:"tbsp"}, "Plain yogurt": {amt:1, unit:"cup"},
  "Shredded cheese": {amt:1, unit:"cup"}, "Sour cream": {amt:0.25, unit:"cup"}, "Cottage cheese": {amt:1, unit:"cup"},
  "Cream cheese": {amt:2, unit:"tbsp"},
  "Rolled oats": {amt:0.5, unit:"cup"}, "Honey": {amt:1, unit:"tbsp"}, "Peanut butter": {amt:2, unit:"tbsp"},
  "Granola": {amt:0.5, unit:"cup"}, "Flour tortillas": {amt:4, unit:"ct"}, "Salsa": {amt:0.25, unit:"cup"},
  "Flour": {amt:1, unit:"cup"}, "Rice": {amt:1, unit:"cup"}, "Canned tomato soup": {amt:1, unit:"can"},
  "Short pasta": {amt:8, unit:"oz"}, "Italian dressing": {amt:0.25, unit:"cup"}, "Mayonnaise": {amt:2, unit:"tbsp"},
  "Chicken broth": {amt:2, unit:"cup"}, "Soy sauce": {amt:2, unit:"tbsp"}, "Olive oil": {amt:2, unit:"tbsp"},
  "Spaghetti": {amt:8, unit:"oz"}, "Marinara sauce": {amt:1, unit:"cup"}, "Corn tortillas": {amt:6, unit:"ct"},
  "Canned diced tomatoes": {amt:1, unit:"can"}, "Chili powder": {amt:1, unit:"tbsp"}, "BBQ sauce": {amt:0.5, unit:"cup"},
  "Hamburger buns": {amt:4, unit:"ct"}, "Sandwich bread": {amt:4, unit:"slice"},
  "Quinoa": {amt:0.5, unit:"cup"}, "English muffins": {amt:2, unit:"ct"}, "Pita bread": {amt:2, unit:"ct"},
  "Hummus": {amt:0.25, unit:"cup"},
  "Frozen mixed berries": {amt:1, unit:"cup"}, "Frozen corn": {amt:1, unit:"cup"},
  "Frozen mixed vegetables": {amt:2, unit:"cup"}, "Frozen broccoli": {amt:1, unit:"cup"}
};

// ---------- recipe pools ----------
// cal/p/c/f are estimated per serving (calories, protein g, carbs g, fat g) — a
// reasonable planning estimate, not a lab measurement.
var RECIPES_B = [
  {n:"Oatmeal, Banana & Cinnamon", ing:["Rolled oats","Banana","Milk","Honey"], steps:["Simmer oats in milk 5 min.","Top with sliced banana, cinnamon, and honey."], cal:320, p:8, c:60, f:6},
  {n:"Scrambled Eggs & Toast", ing:["Eggs","Butter","Sandwich bread"], steps:["Scramble eggs in butter over low heat.","Toast bread; season and serve together."], cal:340, p:16, c:28, f:18},
  {n:"Peanut Butter Banana Toast", ing:["Sandwich bread","Peanut butter","Banana"], steps:["Toast bread and spread with peanut butter.","Top with sliced banana."], cal:350, p:11, c:45, f:15},
  {n:"Yogurt Parfait", ing:["Plain yogurt","Granola","Frozen mixed berries","Honey"], steps:["Thaw berries slightly.","Layer yogurt, granola, and berries; drizzle with honey."], cal:300, p:14, c:45, f:7},
  {n:"Breakfast Burrito", ing:["Eggs","Canned black beans","Shredded cheese","Flour tortillas","Salsa"], steps:["Scramble eggs; warm beans.","Fill tortilla with eggs, beans, cheese, and salsa; roll up."], cal:420, p:20, c:40, f:20},
  {n:"Overnight Oats", ing:["Rolled oats","Milk","Plain yogurt","Honey","Frozen mixed berries"], steps:["Stir oats, milk, yogurt, and honey together; refrigerate overnight.","Top with berries before eating."], cal:340, p:13, c:55, f:8},
  {n:"Veggie Omelet", ing:["Eggs","Bell pepper","Yellow onion","Shredded cheese"], steps:["Sauté diced pepper and onion until soft.","Pour in beaten eggs, add cheese, fold when set."], cal:310, p:22, c:8, f:21},
  {n:"Banana Pancakes", ing:["Flour","Eggs","Milk","Banana","Butter"], steps:["Mix flour, eggs, milk, and mashed banana into a batter.","Cook in butter on a griddle until golden on both sides."], cal:420, p:12, c:60, f:14},
  {n:"Breakfast Quesadilla", ing:["Eggs","Shredded cheese","Flour tortillas","Salsa"], steps:["Scramble eggs and place on a tortilla with cheese.","Fold, crisp in a dry pan, serve with salsa."], cal:380, p:19, c:30, f:21},
  {n:"Cottage Cheese & Fruit Bowl", ing:["Cottage cheese","Banana","Frozen mixed berries","Honey"], steps:["Thaw berries slightly.","Combine cottage cheese, banana, and berries; drizzle with honey."], cal:220, p:18, c:28, f:4},
  {n:"Turkey Sausage & Egg Skillet", ing:["Ground turkey","Eggs","Bell pepper","Yellow onion"], steps:["Brown turkey with diced pepper and onion until cooked through.","Push to one side, scramble in eggs, then mix together."], cal:360, p:28, c:8, f:24},
  {n:"Apple Cinnamon Oatmeal", ing:["Rolled oats","Apple","Milk","Honey"], steps:["Simmer oats in milk 5 min with diced apple.","Stir in cinnamon and honey before serving."], cal:310, p:8, c:58, f:5},
  {n:"English Muffin Breakfast Sandwich", ing:["English muffins","Eggs","Shredded cheese","Bacon"], steps:["Cook bacon and fry an egg.","Layer egg, bacon, and cheese between split, toasted muffins."], cal:400, p:22, c:30, f:21},
  {n:"Spinach & Mushroom Scramble", ing:["Eggs","Spinach","Mushrooms","Butter"], steps:["Sauté mushrooms and spinach in butter until wilted.","Pour in beaten eggs and scramble together."], cal:280, p:18, c:6, f:20},
  {n:"Peanut Butter Apple Toast", ing:["Sandwich bread","Peanut butter","Apple"], steps:["Toast bread and spread with peanut butter.","Top with thin apple slices."], cal:330, p:10, c:42, f:14},
  {n:"Quinoa Breakfast Bowl", ing:["Quinoa","Milk","Banana","Honey"], steps:["Cook quinoa in milk until creamy.","Top with sliced banana and a drizzle of honey."], cal:340, p:10, c:60, f:6},
  {n:"Cream Cheese & Veggie English Muffin", ing:["English muffins","Cream cheese","Cucumber","Cherry tomatoes"], steps:["Split and toast the muffins, spread with cream cheese.","Top with sliced cucumber and cherry tomatoes."], cal:300, p:10, c:40, f:11},
  {n:"Sweet Potato Hash & Eggs", ing:["Sweet potato","Eggs","Bell pepper","Olive oil"], steps:["Dice and pan-fry sweet potato and pepper in oil until tender.","Make a well and fry the eggs in the same pan."], cal:340, p:16, c:34, f:16},
  {n:"Apple Yogurt Parfait", ing:["Plain yogurt","Apple","Granola","Honey"], steps:["Dice the apple and mix with a spoonful of honey.","Layer with yogurt and granola in a bowl or jar."], cal:320, p:12, c:52, f:7},
  {n:"Cabbage & Egg Hash", ing:["Cabbage","Eggs","Bacon","Butter"], steps:["Cook bacon, then sauté shredded cabbage in the drippings and butter until soft.","Push cabbage aside and fry the eggs in the same pan."], cal:360, p:20, c:14, f:26}
];
var RECIPES_L = [
  {n:"Rice & Bean Bowl", ing:["Rice","Canned black beans","Salsa","Lime"], steps:["Warm rice and beans together.","Top with salsa and a squeeze of lime."], cal:420, p:14, c:75, f:6},
  {n:"Grilled Cheese & Tomato Soup", ing:["Sandwich bread","Shredded cheese","Butter","Canned tomato soup"], steps:["Butter bread, add cheese, grill both sides until golden.","Heat soup and serve alongside."], cal:460, p:16, c:45, f:24},
  {n:"Pasta Salad", ing:["Short pasta","Bell pepper","Cucumber","Cherry tomatoes","Italian dressing"], steps:["Cook pasta; cool under water.","Toss with chopped veggies and dressing."], cal:380, p:10, c:52, f:14},
  {n:"Loaded Baked Potato", ing:["Russet potato","Shredded cheese","Canned black beans","Sour cream"], steps:["Microwave or bake potato until soft.","Split and top with beans, cheese, and sour cream."], cal:350, p:12, c:55, f:10},
  {n:"Tuna Salad Sandwich", ing:["Canned tuna","Mayonnaise","Sandwich bread"], steps:["Mix tuna with mayo.","Serve on bread as a sandwich."], cal:400, p:24, c:34, f:18},
  {n:"Chicken & Rice Soup", ing:["Chicken thighs","Rice","Chicken broth","Carrot","Yellow onion"], steps:["Simmer chicken, carrot, and onion in broth until chicken is cooked.","Shred chicken, stir in cooked rice, and serve."], cal:340, p:24, c:38, f:9},
  {n:"Bean & Corn Salad", ing:["Canned black beans","Frozen corn","Bell pepper","Lime","Olive oil"], steps:["Thaw corn; combine with beans and diced pepper.","Dress with lime juice and olive oil."], cal:320, p:12, c:48, f:9},
  {n:"Ham & Cheese Sandwich", ing:["Deli ham","Shredded cheese","Sandwich bread","Mayonnaise"], steps:["Layer ham and cheese on bread with mayo.","Slice and serve, or grill for a warm version."], cal:420, p:22, c:36, f:20},
  {n:"Egg Salad Wrap", ing:["Eggs","Mayonnaise","Flour tortillas"], steps:["Boil and chop eggs; mix with mayo.","Spoon into a tortilla and wrap."], cal:380, p:16, c:28, f:22},
  {n:"Leftover Fried Rice", ing:["Rice","Eggs","Frozen mixed vegetables","Soy sauce"], steps:["Scramble egg in a hot pan, push to the side.","Add rice and veggies, stir-fry with soy sauce."], cal:380, p:15, c:50, f:12},
  {n:"Chickpea Salad Sandwich", ing:["Canned chickpeas","Mayonnaise","Sandwich bread","Cucumber"], steps:["Mash chickpeas with mayonnaise and diced cucumber.","Spread on bread and serve as a sandwich."], cal:400, p:14, c:50, f:16},
  {n:"Hummus & Veggie Pita", ing:["Pita bread","Hummus","Cucumber","Cherry tomatoes"], steps:["Split and warm the pita.","Spread with hummus and fill with sliced cucumber and cherry tomatoes."], cal:360, p:12, c:52, f:12},
  {n:"Lentil Soup", ing:["Canned lentils","Carrot","Yellow onion","Chicken broth"], steps:["Sauté carrot and onion until soft.","Add lentils and broth, simmer 10 min."], cal:320, p:18, c:48, f:6},
  {n:"Quinoa & Black Bean Bowl", ing:["Quinoa","Canned black beans","Bell pepper","Lime"], steps:["Cook quinoa; warm the black beans.","Toss together with diced pepper and a squeeze of lime."], cal:400, p:16, c:68, f:7},
  {n:"Salmon Salad Sandwich", ing:["Canned salmon","Mayonnaise","Sandwich bread"], steps:["Flake the salmon and mix with mayonnaise.","Serve on bread as a sandwich."], cal:420, p:26, c:30, f:22},
  {n:"Turkey Taco Bowl", ing:["Ground turkey","Rice","Canned black beans","Salsa"], steps:["Brown the ground turkey with a pinch of chili powder.","Serve over rice with black beans and salsa."], cal:460, p:30, c:48, f:14},
  {n:"Greek-Style Cucumber Salad", ing:["Cucumber","Cherry tomatoes","Cottage cheese","Italian dressing"], steps:["Chop cucumber and cherry tomatoes.","Toss with cottage cheese and dressing."], cal:260, p:16, c:18, f:14},
  {n:"Zucchini & Chickpea Salad", ing:["Zucchini","Canned chickpeas","Bell pepper","Olive oil"], steps:["Dice zucchini and pepper; toss with chickpeas.","Dress with olive oil and a pinch of salt."], cal:340, p:12, c:42, f:14},
  {n:"Egg & Spinach Wrap", ing:["Eggs","Spinach","Shredded cheese","Flour tortillas"], steps:["Scramble eggs with wilted spinach and cheese.","Roll up in a warm tortilla."], cal:380, p:20, c:28, f:21},
  {n:"Cabbage & Black Bean Slaw Bowl", ing:["Cabbage","Canned black beans","Lime","Olive oil"], steps:["Shred the cabbage and toss with black beans.","Dress with lime juice and olive oil."], cal:320, p:12, c:46, f:10}
];
var RECIPES_D = [
  {n:"Sheet-Pan Chicken, Potatoes & Green Beans", ing:["Chicken thighs","Russet potato","Green beans","Olive oil"], steps:["Toss everything in oil on a sheet pan.","Roast at 425°F for 30–35 min, until chicken is cooked through."], cal:430, p:32, c:38, f:15},
  {n:"Spaghetti with Marinara & Fried Egg", ing:["Spaghetti","Marinara sauce","Eggs","Olive oil"], steps:["Cook spaghetti; warm marinara.","Top pasta with sauce and a fried egg."], cal:460, p:18, c:62, f:15},
  {n:"One-Pot Chicken & Rice", ing:["Chicken thighs","Rice","Chicken broth","Frozen mixed vegetables","Yellow onion"], steps:["Brown chicken and onion in a pot.","Add rice and broth, simmer covered 18 min, stir in veggies last 5 min."], cal:440, p:30, c:48, f:12},
  {n:"Black Bean Tacos", ing:["Canned black beans","Corn tortillas","Shredded cheese","Salsa","Lime"], steps:["Warm beans with a pinch of chili powder.","Fill warmed tortillas with beans, cheese, salsa, and lime."], cal:400, p:16, c:52, f:14},
  {n:"Sausage, Peppers & Onions over Rice", ing:["Smoked sausage","Bell pepper","Yellow onion","Rice"], steps:["Slice and sauté sausage, peppers, and onion until browned.","Serve over cooked rice."], cal:480, p:18, c:48, f:24},
  {n:"Budget Chili", ing:["Ground beef","Canned diced tomatoes","Canned kidney beans","Yellow onion","Chili powder"], steps:["Brown beef and onion; drain if needed.","Add tomatoes, beans, and chili powder; simmer 20 min."], cal:390, p:26, c:34, f:16},
  {n:"Veggie Stir-Fry over Rice", ing:["Frozen mixed vegetables","Rice","Soy sauce","Garlic","Olive oil"], steps:["Stir-fry vegetables and garlic in oil until tender.","Add soy sauce and serve over rice."], cal:340, p:9, c:56, f:9},
  {n:"Baked Ziti", ing:["Short pasta","Marinara sauce","Shredded cheese","Cottage cheese"], steps:["Mix cooked pasta with marinara and cottage cheese.","Top with shredded cheese, bake at 375°F for 20 min."], cal:480, p:24, c:50, f:20},
  {n:"Chicken Fajitas", ing:["Chicken thighs","Bell pepper","Yellow onion","Flour tortillas"], steps:["Slice chicken, pepper, and onion; sauté until cooked through.","Serve in warm tortillas."], cal:400, p:28, c:38, f:13},
  {n:"Pork Chops & Roasted Veg", ing:["Pork chops","Russet potato","Green beans","Olive oil"], steps:["Toss potato and green beans in oil, roast 20 min at 425°F.","Sear pork chops and add to the pan for the last 10 min."], cal:420, p:30, c:32, f:17},
  {n:"Meatloaf & Mashed Potatoes", ing:["Ground beef","Russet potato","Yellow onion","Canned diced tomatoes"], steps:["Mix beef with diced onion and a little tomato; shape into a loaf and bake at 375°F, 45 min.","Boil and mash potatoes; serve alongside."], cal:460, p:26, c:38, f:22},
  {n:"Stuffed Peppers", ing:["Bell pepper","Ground beef","Rice","Canned diced tomatoes"], steps:["Brown beef, mix with cooked rice and tomatoes.","Stuff into halved peppers, bake at 375°F for 25 min."], cal:400, p:22, c:38, f:16},
  {n:"Baked Chicken Parmesan", ing:["Chicken thighs","Marinara sauce","Shredded cheese","Spaghetti"], steps:["Bake chicken thighs at 400°F until nearly done.","Top with marinara and cheese, bake 10 more min; serve over spaghetti."], cal:470, p:32, c:42, f:18},
  {n:"Slow Cooker BBQ Pulled Pork Sandwiches", ing:["Pork shoulder","BBQ sauce","Hamburger buns"], steps:["Slow-cook pork shoulder with BBQ sauce 6–8 hrs until it shreds easily.","Pile onto buns."], cal:480, p:28, c:46, f:18},
  {n:"Breakfast for Dinner", ing:["Eggs","Bacon","Sandwich bread","Butter"], steps:["Cook bacon; scramble eggs in the same pan.","Serve with buttered toast."], cal:420, p:20, c:26, f:26},
  {n:"Vegetable Soup & Grilled Cheese", ing:["Canned diced tomatoes","Carrot","Frozen mixed vegetables","Sandwich bread","Shredded cheese"], steps:["Simmer tomatoes, carrot, and frozen veggies into a soup.","Serve with a grilled cheese sandwich."], cal:380, p:15, c:42, f:16},
  {n:"Beef & Broccoli Stir-Fry", ing:["Ground beef","Frozen broccoli","Rice","Soy sauce"], steps:["Brown beef, add thawed broccoli and soy sauce, stir-fry until hot.","Serve over rice."], cal:420, p:26, c:36, f:18},
  {n:"White Chicken Chili", ing:["Chicken thighs","Canned white beans","Chicken broth","Yellow onion","Chili powder"], steps:["Simmer chicken and onion in broth with chili powder until cooked.","Shred chicken, stir in white beans, simmer 10 more min."], cal:380, p:28, c:32, f:14},
  {n:"Turkey Meatballs & Spaghetti", ing:["Ground turkey","Spaghetti","Marinara sauce","Shredded cheese"], steps:["Shape turkey into meatballs and brown, then simmer in marinara until cooked through.","Serve over spaghetti with a scatter of cheese."], cal:480, p:30, c:50, f:16},
  {n:"Salmon Cakes & Roasted Sweet Potato", ing:["Canned salmon","Sweet potato","Eggs","Olive oil"], steps:["Mix salmon with a beaten egg, form patties, and pan-fry in oil until golden.","Roast diced sweet potato alongside at 425°F, 20 min."], cal:420, p:28, c:34, f:18},
  {n:"Turkey Chili", ing:["Ground turkey","Canned diced tomatoes","Canned kidney beans","Chili powder"], steps:["Brown the ground turkey.","Add tomatoes, beans, and chili powder; simmer 20 min."], cal:380, p:28, c:32, f:14},
  {n:"Chickpea Curry over Rice", ing:["Canned chickpeas","Canned diced tomatoes","Yellow onion","Rice"], steps:["Sauté onion, add tomatoes and chickpeas with a pinch of chili powder, simmer 15 min.","Serve over cooked rice."], cal:420, p:14, c:72, f:8},
  {n:"Lentil & Vegetable Stew", ing:["Canned lentils","Carrot","Frozen mixed vegetables","Chicken broth"], steps:["Simmer carrot in broth until nearly tender.","Add lentils and frozen vegetables, simmer 10 more min."], cal:360, p:18, c:56, f:6},
  {n:"Zucchini Turkey Skillet", ing:["Ground turkey","Zucchini","Marinara sauce","Shredded cheese"], steps:["Brown the turkey with sliced zucchini.","Stir in marinara, top with cheese, and melt covered over low heat."], cal:400, p:28, c:18, f:24},
  {n:"Stuffed Sweet Potatoes", ing:["Sweet potato","Canned black beans","Shredded cheese","Salsa"], steps:["Bake sweet potatoes at 400°F until soft, about 40 min.","Split and top with warmed black beans, cheese, and salsa."], cal:380, p:16, c:58, f:10},
  {n:"Mushroom & Spinach Quesadilla", ing:["Mushrooms","Spinach","Shredded cheese","Flour tortillas"], steps:["Sauté mushrooms and spinach until soft.","Fill a tortilla with the mix and cheese, fold, and crisp in a dry pan."], cal:380, p:16, c:34, f:21},
  {n:"Turkey & Broccoli Stir-Fry", ing:["Ground turkey","Frozen broccoli","Rice","Soy sauce"], steps:["Brown the turkey, add thawed broccoli and soy sauce, stir-fry until hot.","Serve over rice."], cal:420, p:28, c:40, f:14},
  {n:"Cabbage & Sausage Skillet", ing:["Cabbage","Smoked sausage","Yellow onion","Olive oil"], steps:["Slice sausage and sauté with onion until browned.","Add shredded cabbage and cook until tender, about 8 min."], cal:400, p:16, c:22, f:28},
  {n:"Quinoa Stuffed Peppers", ing:["Bell pepper","Quinoa","Canned black beans","Canned diced tomatoes"], steps:["Cook quinoa and mix with black beans and tomatoes.","Stuff into halved peppers, bake at 375°F for 25 min."], cal:360, p:14, c:60, f:8},
  {n:"Baked Chicken & Sweet Potato", ing:["Chicken thighs","Sweet potato","Green beans","Olive oil"], steps:["Toss diced sweet potato and green beans with oil on a sheet pan.","Add chicken thighs and roast at 425°F for 30–35 min."], cal:440, p:32, c:36, f:16}
];

// ---------- 91-day rotation (13 weeks) over the expanded pools (20 breakfast / 20 lunch / 30 dinner) ----------
// Generated by trying many seeded shuffles and keeping the one with the lowest
// max weekly-average-calorie deviation from the 13-week mean (best: seed 236, 1.41% max
// deviation) while guaranteeing no immediate day-to-day repeat within any meal slot.
var ROTATION = [{"b":13,"l":10,"d":26},{"b":3,"l":17,"d":11},{"b":8,"l":7,"d":6},{"b":12,"l":3,"d":12},{"b":16,"l":9,"d":29},{"b":0,"l":18,"d":28},{"b":1,"l":4,"d":21},{"b":6,"l":19,"d":24},{"b":9,"l":11,"d":1},{"b":17,"l":15,"d":14},{"b":15,"l":2,"d":18},{"b":19,"l":12,"d":3},{"b":14,"l":0,"d":2},{"b":4,"l":14,"d":25},{"b":18,"l":1,"d":8},{"b":7,"l":13,"d":0},{"b":5,"l":6,"d":9},{"b":2,"l":16,"d":7},{"b":11,"l":8,"d":19},{"b":10,"l":5,"d":22},{"b":14,"l":19,"d":5},{"b":3,"l":5,"d":17},{"b":15,"l":14,"d":23},{"b":10,"l":11,"d":15},{"b":0,"l":17,"d":10},{"b":2,"l":2,"d":20},{"b":6,"l":0,"d":13},{"b":19,"l":3,"d":27},{"b":11,"l":8,"d":16},{"b":9,"l":9,"d":4},{"b":18,"l":16,"d":27},{"b":4,"l":10,"d":1},{"b":1,"l":18,"d":8},{"b":12,"l":6,"d":11},{"b":5,"l":15,"d":24},{"b":7,"l":4,"d":25},{"b":13,"l":12,"d":28},{"b":8,"l":13,"d":3},{"b":17,"l":1,"d":6},{"b":16,"l":7,"d":21},{"b":10,"l":3,"d":10},{"b":4,"l":9,"d":5},{"b":18,"l":1,"d":26},{"b":13,"l":7,"d":22},{"b":6,"l":5,"d":4},{"b":11,"l":10,"d":20},{"b":12,"l":4,"d":17},{"b":14,"l":18,"d":0},{"b":16,"l":12,"d":19},{"b":3,"l":6,"d":13},{"b":8,"l":15,"d":9},{"b":1,"l":14,"d":15},{"b":2,"l":17,"d":14},{"b":19,"l":8,"d":18},{"b":5,"l":16,"d":23},{"b":9,"l":2,"d":7},{"b":17,"l":13,"d":16},{"b":15,"l":11,"d":29},{"b":0,"l":19,"d":12},{"b":7,"l":0,"d":2},{"b":11,"l":10,"d":9},{"b":16,"l":4,"d":12},{"b":18,"l":6,"d":24},{"b":8,"l":12,"d":18},{"b":10,"l":13,"d":15},{"b":19,"l":11,"d":19},{"b":4,"l":1,"d":5},{"b":13,"l":19,"d":16},{"b":9,"l":2,"d":11},{"b":3,"l":7,"d":21},{"b":1,"l":18,"d":10},{"b":0,"l":14,"d":26},{"b":17,"l":15,"d":28},{"b":15,"l":3,"d":1},{"b":5,"l":5,"d":27},{"b":2,"l":17,"d":8},{"b":6,"l":9,"d":7},{"b":12,"l":8,"d":4},{"b":14,"l":0,"d":23},{"b":7,"l":16,"d":14},{"b":17,"l":6,"d":0},{"b":5,"l":12,"d":20},{"b":2,"l":0,"d":17},{"b":13,"l":5,"d":13},{"b":0,"l":14,"d":25},{"b":14,"l":17,"d":3},{"b":3,"l":4,"d":2},{"b":11,"l":13,"d":6},{"b":8,"l":8,"d":22},{"b":7,"l":10,"d":29},{"b":1,"l":2,"d":24}];
var N_WEEKS = 13;
