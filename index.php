<?php

//
// LIST CONVERSIONS TO CREATE AN INDEX
//

// interpret formats
$interpret = array(
	'text', 'htmlentities', 'morsecode', 'navajo',
	'decimal', 'binary', 'octal', 'hexadecimal', 'roman-numerals',
	'atbash', 'caesar', 'vigenere', 'ita2', 'rot13',
	'base64');

// convert formats
$convert = array(
	'text', 'flipped', 'htmlentities', 'morsecode', 'leetspeak', 'navajo',
	'decimal', 'binary', 'octal', 'hexadecimal', 'roman-numerals',
	'atbash', 'caesar', 'vigenere', 'ita2', 'pigpen', 'rot13',
	'base64',
	'md5', 'sha1');

// format titles
$formats = array(
	'text' => 'Text',
	'flipped' => 'Flipped',
	'htmlentities' => 'HTML Entities',
	'morsecode' => 'Morsecode',
	'leetspeak' => 'Leetspeak',
	'navajo' => 'Navajo code',
	'decimal' => 'Decimal',
	'binary' => 'Binary',
	'octal' => 'Octal',
	'hexadecimal' => 'Hexadecimal',
	'roman-numerals' => 'Roman numerals',
	'atbash' => 'Atbash Roman',
	'caesar' => 'Caesar Cipher',
	'vigenere' => 'Vigenère Cipher',
	'ita2' => 'ITA2 / CCITT-2',
	'pigpen' => 'Pigpen cipher',
	'rot13' => 'ROT13',
	'base64' => 'Base 64',
	'md5' => 'MD5',
	'sha1' => 'SHA-1');

// create conversions
$conversions = array();

// list possible conversions
// go through interpret formats
foreach ($interpret as $interpret_format)
	// go through convert formats of this interpret format
	foreach ($convert as $convert_format)
		if (
			// exclude conversions with the
			//  same interpret and convert formats
			$interpret_format != $convert_format
			// exclude current formats
			&& !(
				$_interpret_format == $interpret_format
				&& $_convert_format == $convert_format)) {
			// collect information
			$url = sprintf('/%s/%s',
				$interpret_format,
				$convert_format);
			$name = sprintf('%s to %s',
				$formats[$interpret_format],
				$formats[$convert_format]);
			// add to list
			$conversions[$url] = $name;
		}

//
// ROUTE URL
//

// read url
list($url) = explode('?', $_SERVER['REQUEST_URI']);

if ($url == '/sitemap.xml')
{
	// header
	header('Content-Type: text/xml');
	// output sitemap
	echo '<?xml version="1.0" encoding="UTF-8" ?>' . "\r\n";
	echo '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' . "\r\n";
	foreach ($conversions as $url => $name)
		echo "\t" . '<url><loc>http://' . $_SERVER['SERVER_NAME'] . $url . '</loc></url>' . "\r\n";
	echo '</urlset>' . "\r\n";
	// cancel here
	die();
}
else if ($url != '/')
{
	$url_parts = explode('/', $url);
	// add formats to title
	list($_interpret_format) = explode(';', $url_parts[1]);
	list($_convert_format) = explode(';', $url_parts[2]);
	$title = null;
	// interpret url
	if ($formats[$_interpret_format]
		&& $formats[$_convert_format])
		// add title
		$title =
			'Convert '
			. $formats[$_interpret_format]
			. ' to '
			. $formats[$_convert_format];
	else {
		// redirect to homepage
		header('Location: /');
		header('HTTP/1.1 301 Moved Permanently');
	}
}
else
{
	// title for index page
	$title = 'Fast converting, encrypting and decrypting';
}
?>
<!--
Hi there!
Thank you for your interest in the source code of Cryptii.
Perhaps it would be easyer to browse the code on GitHub.
https://github.com/the2f/Cryptii
-->

<!DOCTYPE html>
<html>
	<head prefix="og: http://ogp.me/ns#">
		<meta charset="utf-8">
		<base href="/">

		<title>Cryptii<?= $title ? ' — ' . $title : '' ?></title>

		<meta property="og:title" content="Cryptii<?= $title ? ' — ' . $title : '' ?>">
		<meta property="og:site_name" content="Cryptii">
		<meta property="og:type" content="website">
		<meta property="og:url" content="http://cryptii.com<?= $url ?>">
		<meta property="og:description" content="Cryptii is an OpenSource web application under the MIT license where you can convert, encrypt and decrypt content between different format systems.">
		<meta property="og:image" content="http://cryptii.com/images/cryptii.png">
		<meta property="og:image:type" content="image/png">
		<meta property="og:image:width" content="277">
		<meta property="og:image:height" content="277">

		<link rel="shortcut icon" type="image/x-icon" href="images/favicon.ico">
		<link rel="stylesheet" href="css/default.css?v=7" media="screen">
		<link rel="stylesheet" href="css/jquery.ui.slider.min.css" media="screen">
	</head>
	<body>

		<div id="frame">
			<div id="wrapper">

				<hgroup>
					<h1>
						<a href="/text/decimal">Cryptii</a>
						<span class="format"><?= $title ? ' — ' . $title : '' ?></span>
					</h1>
					<h2>Convert, encode, encrypt, decode and decrypt your content online</h2>
				</hgroup>

				<div id="about">
					<p>
						Designed and coded with &#60;3<br>
						Brought to you by <a href="http://fraenz.frieder.es/" target="_blank">ffraenz</a>
					</p>
					<div id="social">
						<a class="facebook" href="https://facebook.com/thetwof" target="_blank"><span>Find the2f on Facebook</span></a>
						<a class="twitter" href="https://twitter.com/ffraenz" target="_blank"><span>Follow @ffraenz on Twitter</span></a>
						<a class="gittip" href="https://www.gittip.com/ffraenz/" target="_blank"><span>Find ffraenz on Gittip</span></a>
					</div>
				</div>

				<p class="intro">
					Don't leave your messages plaintext on public places.
					Cryptii is an OpenSource web application under the
					<a href="https://github.com/the2f/Cryptii#license" target="_blank">MIT license</a>
					where you can convert, encrypt and decrypt content between different format systems.
					This happens fully in your browser using
					<a href="http://en.wikipedia.org/wiki/JavaScript" target="_blank">JavaScript</a>,
					no content will be sent to any kind of server.
					Any feedback appreciated, just leave me a tweet or contribute to this project
					 — <a href="http://fraenz.frieder.es/portfolio/cryptii/" target="_blank">Read more</a>
				</p>

				<!-- this sitemap mentions other possible conversions -->
				<nav id="sitemap">
					<h2>Possible conversions</h2>

					<ul><?php
						// list possible conversions
						// go through interpret formats
						foreach ($conversions as $url => $name)
							// add to list
							echo "\r\n\t\t\t\t\t\t\t"
								. '<li>'
								. '<a href="' . $url . '">'
								. $name
								. '</a>'
								. '</li>';
						// add new line at beginning
						echo "\r\n\t\t\t\t\t\t";
					?></ul>
				</nav>

				<div id="application"></div>
			</div>
		</div>

		<!-- fork me -->
		<a href="https://github.com/the2f/Cryptii" id="forkme" target="_blank">Fork me on GitHub</a>

		<!-- include jquery and plugins -->
		<script src="http://code.jquery.com/jquery-latest.js"></script>
		<script>
		// fallback if jQuery is not available
		if (typeof jQuery == 'undefined')
			document.write('<script src="js/jquery.min.js"></scr' + 'ipt>');
		</script>
		<script src="js/jquery.ui.slider.min.js"></script>
		<script src="js/jquery.history.js"></script>

		<!-- include analytics -->
		<script src="http://www.google-analytics.com/ga.js"></script>
		<script>
		var _gaq = _gaq || [];
		_gaq.push(['_setAccount', 'UA-4208952-24']);
		_gaq.push(['_trackPageview']);
		</script>

		<!-- include main application -->
		<script src="js/cryptii.min.js"></script>
		<script>
		// start application
		cryptii.init();
		</script>

	</body>
</html>
