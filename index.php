<?php

//
// LIST CONVERSIONS TO CREATE AN INDEX
//

// interpret formats
$interpret = array(
	'text', 'htmlentities', 'morsecode',
	'decimal', 'binary', 'octal', 'hexadecimal',
	'atbash', 'caesar', 'ita2', 'rot13',
	'base64');

// convert formats
$convert = array(
	'text', 'flipped', 'htmlentities', 'morsecode', 'leetspeak',
	'decimal', 'binary', 'octal', 'hexadecimal',
	'atbash', 'caesar', 'ita2', 'pigpen', 'rot13',
	'base64',
	'md5', 'sha1');

// format titles
$formats = array(
	'text' => 'Text',
	'flipped' => 'Flipped',
	'htmlentities' => 'HTML Entities',
	'morsecode' => 'Morsecode',
	'leetspeak' => 'Leetspeak',
	'decimal' => 'Decimal',
	'binary' => 'Binary',
	'octal' => 'Octal',
	'hexadecimal' => 'Hexadecimal',
	'atbash' => 'Atbash Roman',
	'caesar' => 'Caesar Cipher',
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
	$_interpret_format = $url_parts[1];
	$_convert_format = $url_parts[2];
	$title = null;
	// interpret url
	if ($formats[$_interpret_format]
		&& $formats[$_convert_format])
		// add title
		$title =
			$formats[$_interpret_format]
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
<!DOCTYPE html>
<html>
	<head>
		<meta charset="utf-8">
		<base href="/">

		<title>Cryptii<?= $title ? ' — ' . $title : '' ?></title>

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
						Coded and designed with &#60;3<br>
						Brought to you by <a href="http://fraenz.frieder.es/" target="_blank">ffraenz</a>
					</p>
					<div id="social">
						<a class="facebook" href="https://facebook.com/thetwof" target="_blank"><span>Find the2f on Facebook</span></a>
						<a class="twitter" href="https://twitter.com/ffraenz" target="_blank"><span>Follow @ffraenz on Twitter</span></a>
						<a class="gittip" href="https://www.gittip.com/ffraenz/" target="_blank"><span>Find ffraenz on Gittip</span></a>
					</div>
				</div>

				<p class="intro">
					Don't make it that easy, don't leave your content plaintext on public places.<br>
					Cryptii is a place where you can convert, encrypt and decrypt content between different formats. Notice that this process
					happens in your browser using JavaScript, no content will be sent to any kind of server. If you have any questions or suggestions
					to improve this app, leave me a tweet — <a href="http://fraenz.frieder.es/portfolio/cryptii/" target="_blank">Read more</a>
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
		<script src="http://www.google-analytics.com/ga.js" async></script>
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
