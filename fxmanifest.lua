fx_version "cerulean"
games { "gta5" }

author "Fraser Watt (https://github.com/FrazzIe)"
description "A vehicle catalog to be used with FiveM"
version "0.1"

lua54 "yes"

ui_page "ui/index.html"

files {
	"ui/index.html",
	"ui/css/*.css",
	"ui/js/*.js",
	"ui/img/*.*",
	"vehicles.js"
}

shared_scripts {

}

client_scripts {
	"script/cl_config.js",
	"script/cl_util.js",
	"script/cl_images.js",
	"script/cl_catalog.js"
}

server_scripts {
	"script/sv_upload.js"
}