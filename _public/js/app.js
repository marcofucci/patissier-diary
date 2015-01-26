"use strict";var App=angular.module("app",["ngCookies","ngResource","ngRoute","app.states","angularMoment","textAngular","ui.bootstrap","ui.router","app.routes","app.services","app.controllers","app.directives","app.filters","partials"]);App.run(["$state",function(e){e.go("type_detail",{typeId:1})}]),App.config(function(){var e=require("nw.gui"),t=e.Window.get(),r=new e.Menu({type:"menubar"});try{r.createMacBuiltin("My App"),t.menu=r}catch(n){console.log(n.message)}});var DEBUG=!1,Constants={DB_PATH:process.env.HOME+"/Dropbox/marconess/patissier"+(DEBUG?"_dev":"")+"/data.db",IMG_PATH:process.env.HOME+"/Dropbox/marconess/patissier"+(DEBUG?"_dev":"")+"/images/"};angular.module("app.controllers",[]).controller("LayoutCtrl",["$scope","types",function(e,t){e.types=t}]).controller("TypeDetailCtrl",["$scope","type","recipes",function(e,t,r){e.$parent.current_type=t,e.recipes=r}]).controller("RecipeDetailCtrl",["$scope","type","recipe","tests","$modal","$sce",function(e,t,r,n,a,o){function i(e){a.open({templateUrl:"/partials/test_modal.html",controller:"TestModalCtrl",resolve:{recipe:function(){return r},test:function(){var t={};return angular.copy(e,t),e}}})}e.$parent.current_type=t,e.recipe=r,e.tests=n,e.addTest=function(){i({recipe:r._id})},e.changeTest=function(e){i(e)},e.renderHtml=function(e){return o.trustAsHtml(e.replace(/\n/g,"<br/>"))},e.openImage=function(e){a.open({templateUrl:"/partials/img_modal.html",controller:["$scope","img",function(e,t){e.img=t,e.cancel=function(){e.$dismiss("cancel")}}],resolve:{img:function(){return e}}})},e.openRecipeNotes=function(){a.open({templateUrl:"/partials/recipe_notes_modal.html",controller:"RecipeNotesModalCtrl",backdrop:"static",size:"lg",resolve:{recipe:function(){return r}}})}}]).controller("TestModalCtrl",["$scope","recipe","test","db","$state",function(e,t,r,n,a){e.recipe=t,e.add=void 0===r._id,e.test=r,e.activeTab="general",e.changeTab=function(t){e.activeTab=t};var o=function(){e.cancel(),a.reload()};e.cancel=function(){e.$dismiss("cancel")},e.save=function(){if(r.temp_img){var t=require("fs"),a=require("path"),i=a.extname(r.temp_img),c=require("crypto").randomBytes(64).toString("hex"),l=a.join(Constants.IMG_PATH,c+i);t.createReadStream(r.temp_img).pipe(t.createWriteStream(l)),r.img=l.replace(process.env.HOME,"$HOME"),delete r.temp_img}n.test.saveOrUpdate(e.test,o)},e["delete"]=function(){n.test["delete"](e.test,o)},e.opened=!1,e.openCalendar=function(t){t.preventDefault(),t.stopPropagation(),e.opened=!0}}]).controller("RecipeNotesModalCtrl",["$scope","recipe","db","$state",function(e,t,r,n){e.recipe=t,e.edit=!1,e.changeEdit=function(t){e.edit=t},e.close=function(){e.$dismiss("cancel"),n.reload()}}]).controller("MontlyProgressCtrl",["$scope","data","dates","currentMonth","$state",function(e,t,r,n,a){e.data=t,e.dates=r,e.current_month=n,e.$watch("current_month",function(e){a.go("monthly_progress",{month:e})})}]);var DataStore={};DataStore.create=function(e){return"simple"==e?createSimpleStore():"relational"==e?createRelationalStore():"document"==e?createDocumentStore():void 0};var createSimpleStore=function(){},createRelationalStore=function(){},createDocumentStore=function(){try{var e=require("nedb"),t={collection:function(t){return new e({filename:Constants.DB_PATH+"///"+t,autoload:!0})}};return t}catch(r){console.error("MODULE_NOT_FOUND"==r.code?"NeDB not found. Try `npm install nedb --save` inside of `/app/assets`.":r)}};angular.module("app.directives",["app.services"]).directive("ngReallyClick",[function(){return{restrict:"A",link:function(e,t,r){t.bind("click",function(){var t=r.ngReallyMessage;t&&confirm(t)&&e.$apply(r.ngReallyClick)})}}}]).directive("notesForm",["$timeout","db",function(e,t){return{restrict:"E",require:"ngModel",templateUrl:"/partials/notes_form.html",scope:{model:"=ngModel",ref:"@ngModel"},link:function(r){var n=100,a=null,o=!1,i=function(){o=!1},c=function(t,o){t!==o&&(a&&e.cancel(a),a=e(r.save,n))};r.save=function(){e.cancel(a),o||(o=!0,t.recipe.saveNotes(r.model,i))},r.$watch("model.ingredients",c),r.$watch("model.procedure",c),r.$watch("model.cooking_time",c),r.$watch("model.materials",c)}}}]).directive("monthlyStats",[function(){return{restrict:"E",scope:{val:"="},link:function(e,t){var r={top:20,right:20,bottom:70,left:210},n=900-r.left-r.right,a=1e3-r.top-r.bottom,o=d3.scale.linear().range([0,n]),i=d3.scale.ordinal().rangeRoundBands([0,a],.05),c=d3.select(t[0]).append("svg").attr("width",n+r.left+r.right).attr("height",a+r.top+r.bottom).append("g").attr("transform","translate("+r.left+","+r.top+")"),l=[];e.val.forEach(function(e){l=l.concat(e.recipes)}),o.domain([0,d3.max(l,function(e){return e.count})]),i.domain(l.map(function(e){return e.recipe}));var s=d3.svg.axis().scale(o).orient("bottom");c.append("g").attr("class","x axis").attr("transform","translate(0,"+a+")").call(s).selectAll("text").style("text-anchor","end");var p=d3.svg.axis().scale(i).orient("left").ticks(10);c.append("g").attr("class","y axis").call(p),c.selectAll("bar").data(l).enter().append("rect").style("fill",function(e){var t=e.type._id;return"rgb("+10*t+", "+20*t+", "+40*t+")"}).attr("x",function(){return 0}).attr("width",function(e){return o(e.count)}).attr("y",function(e){return i(e.recipe)}).attr("height",i.rangeBand())}}}]).directive("starRating",["$timeout",function(){return{restrict:"E",require:"ngModel",templateUrl:"/partials/star_rating.html",scope:{model:"=ngModel",ref:"@ngModel",readonly:"=",size:"="},link:function(e,t){$(".rating",t).rating({size:e.size||"xs",showClear:!1,showCaption:!1,readonly:e.readonly}).rating("update",e.model).on("rating.change",function(t,r){e.model=parseFloat(r)})}}}]),angular.module("app.filters",[]).filter("interpolate",["version",function(e){return function(t){return String(t).replace(/\%VERSION\%/gm,e)}}]).filter("nl2br",function(){return function(e){return"undefined"!=typeof e&&e?e.replace(/\n/g,"<br/>"):void 0}}).provider("$home",function(){this.$get=[function(){return function(e){return void 0!==e&&e?e.replace("$HOME",process.env.HOME):e}}]}).filter("home",["$home",function(e){return e}]),function(){angular.module("app.routes",[]).config(["$stateProvider","$locationProvider",function(e,t){t.html5Mode(!0);var r=angular.module("app.states").getStates();angular.forEach(r,function(t){e.state(t)})}])}(),angular.module("app.services",[]).factory("version",function(){return"0.1"}).factory("db",[function(){var e=DataStore.create("document"),t=e.collection("type"),r=e.collection("subtype"),n=e.collection("recipe"),a=e.collection("test"),o={type:{getAll:function(e){return t.find({},e)},getById:function(e,r){return t.findOne({_id:parseInt(e)},r)}},subtype:{getAllByTypeId:function(e,t){return r.find({type:parseInt(e)},t)},getById:function(e,t){return r.findOne({_id:parseInt(e)},t)}},recipe:{getAllByTypeId:function(e,t,r){var a={type:parseInt(e)};return t&&(a.subtype={$exists:!1}),n.find(a,r)},getAllBySubTypeId:function(e,t){return n.find({subtype:parseInt(e)}).sort({order:1}).exec(t)},getById:function(e,t){return n.findOne({_id:parseInt(e)},t)},getStats:function(e,t){a.count({recipe:parseInt(e)},function(r,n){0==n?t(r,{count:n,lastTest:null,avRating:0}):a.find({recipe:parseInt(e)}).sort({date:-1}).exec(function(e,r){var a=r[0],o=0;angular.forEach(r,function(e){o+=e.rating||0}),o/=n,o=Math.ceil(10*o)/10,t(e,{count:n,lastTest:a,avRating:o})})})},getCountPerMonth:function(e,t,r){var n={recipe:parseInt(e)};if(t){var o=t.split("/"),t=parseInt(o[0])-1,i=parseInt(o[1]),c=new Date(i,t,1,0,0,0,0),l=new Date(i,t+1,1,0,0,0,0);n.date={$gt:c,$lt:l}}a.count(n,r)},saveNotes:function(e,t){n.update({_id:e._id},{$set:{notes:e.notes,ingredients:e.ingredients,procedure:e.procedure,cooking_time:e.cooking_time,materials:e.materials}},t)}},test:{getAllByRecipeId:function(e,t){return a.find({recipe:parseInt(e)}).sort({date:-1}).exec(t)},saveOrUpdate:function(e,t){void 0!=e._id?a.update({_id:e._id},{$set:{rating:e.rating,date:e.date,img:e.img,notes:e.notes,aspect_obs:e.aspect_obs,aspect_corr:e.aspect_corr,smell_obs:e.smell_obs,smell_corr:e.smell_corr,taste_obs:e.taste_obs,taste_corr:e.taste_corr,texture_obs:e.texture_obs,texture_corr:e.texture_corr}},function(e,r,n){t(e,n)}):a.insert(e,t)},"delete":function(e,t){a.remove({_id:e._id},t)},getAllMonths:function(e){var t=[];a.find({}).sort({date:-1}).exec(function(r,n){n.forEach(function(e){var r=e.date.getMonth()+1+"/"+e.date.getFullYear();-1==t.indexOf(r)&&t.push(r)}),e(r,t)})}}};return o}]),function(){var e=angular.module("app.states",[]);e.getStates=function(){var e={};return e.Layout={name:"layout","abstract":!0,resolve:{types:["db","$q",function(e,t){var r=t.defer();return e.type.getAll(function(e,t){r.resolve(t)}),r.promise}]},views:{"@":{templateUrl:"/partials/base.html"},"nav@layout":{templateUrl:"/partials/nav.html",controller:"LayoutCtrl"}}},e.Dashboard={name:"dashboard",parent:"layout",url:"#dashboard",templateUrl:"/partials/dashboard.html"},e.TypeDetail={name:"type_detail",parent:"layout",url:"#type={typeId}",templateUrl:"/partials/type_detail.html",controller:"TypeDetailCtrl",resolve:{type:["$stateParams","$q","db",function(e,t,r){var n=t.defer();return r.type.getById(e.typeId,function(e,t){n.resolve(t)}),n.promise}],recipes:["$stateParams","$q","db",function(e,t,r){var n=t.defer(),a=require("wait.for");return a.launchFiber(function(){var t=[],o=a["for"](r.subtype.getAllByTypeId,e.typeId);angular.forEach(o,function(e){var n=a["for"](r.recipe.getAllBySubTypeId,e._id);n.length&&t.push({group:e.name,recipes:n})});var i=a["for"](r.recipe.getAllByTypeId,e.typeId,!0);i.length&&t.push({group:t.length?"Other":"",recipes:i}),angular.forEach(t,function(e){angular.forEach(e.recipes,function(e){var t=a["for"](r.recipe.getStats,e._id);e.stats={count:t.count,lastTest:t.lastTest,avRating:t.avRating}}),n.resolve(t)})}),n.promise}]}},e.RecipeDetail={name:"recipe_detail",parent:"layout",controller:"RecipeDetailCtrl",url:"#type={typeId}&recipe={recipeId}",templateUrl:"/partials/recipe_detail.html",resolve:{type:["$stateParams","$q","db",function(e,t,r){var n=t.defer();return r.type.getById(e.typeId,function(e,t){n.resolve(t)}),n.promise}],recipe:["$stateParams","$q","db",function(e,t,r){var n=t.defer();return r.recipe.getById(e.recipeId,function(e,t){n.resolve(t)}),n.promise}],tests:["$stateParams","$q","db",function(e,t,r){var n=t.defer();return r.test.getAllByRecipeId(e.recipeId,function(e,t){n.resolve(t)}),n.promise}]}},e.MonthlyProgress={name:"monthly_progress",parent:"layout",controller:"MontlyProgressCtrl",url:"#monthly_progress&month={month}",templateUrl:"/partials/monthly_progress.html",resolve:{dates:["$q","db",function(e,t){var r=e.defer();return t.test.getAllMonths(function(e,t){r.resolve(t)}),r.promise}],currentMonth:["$stateParams",function(e){return e.month}],data:["$q","db","types","currentMonth",function(e,t,r,n){var a=e.defer(),o=require("wait.for");return o.launchFiber(function(){var e=[];angular.forEach(r,function(r){if(!r.component){var a={type:r,recipes:[]},i=o["for"](t.recipe.getAllByTypeId,r._id,!1);angular.forEach(i,function(e){var i=o["for"](t.recipe.getCountPerMonth,e._id,n);a.recipes.push({type:r,recipe:e.name,count:i})}),e.push(a)}}),a.resolve(e)}),a.promise}]}},e}}();