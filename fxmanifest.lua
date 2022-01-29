fx_version "cerulean"
games { "gta5" }

author "Fraser Watt (https://github.com/FrazzIe)"
description "A vehicle catalog to be used with FiveM"
version "0.1"

ui_page "ui/index.html"

files {
	"ui/index.html",
	"ui/**/*.*",
	"vehicles.json"
}

client_scripts {
	"script/cl_*.*"
}

server_scripts {
	"script/sv_*.*"
}