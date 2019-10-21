<!DOCTYPE html>
<html>
<head>
	<title>Demo Chat WebSocket</title>
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<style type="text/css"></style>
	<link rel="stylesheet" href="public/style.css">
	<?php
		$colours = array('007AFF','FF7000','FF7000','15E25F','CFC700','CFC700','CF1100','CF00BE','F00');
		$user_colour = array_rand($colours);
	?>
	<script src="public/jquery-3.1.1.js"></script>
	<script src="public/websocket.js"></script>
</head>
<body>
	<div class="chat_wrapper">
		<div class="message_box" id="message_box"></div>
		<div class="panel">
			<input type="text" name="name" id="name" placeholder="Your Name" maxlength="15" class="txtInput" />
			<input type="text" name="message" id="message" placeholder="Message"  class="txtInput"
			onkeydown = "if (event.keyCode == 13)document.getElementById('send-btn').click()"  />
		</div>
		<button id="send-btn" class=button>Send</button>
	</div>
</body>
</html>