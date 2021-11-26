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
	"sh_config.js"
}

shared_scripts {

}

client_scripts {
	"lua/cl_test.lua",
	"lua/cl_images.lua"
}

server_scripts {
	"http/upload.js"
}