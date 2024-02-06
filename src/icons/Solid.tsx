const Solid = (props: any = {}) => (
	<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 160 160" {...props}>
		<linearGradient id="solid_svg__a" x1="24" x2="148.5" y1="5.4" y2="65.9" gradientUnits="userSpaceOnUse">
			<stop offset="0.1" stopColor="#76B3E1"></stop>
			<stop offset="0.3" stopColor="#DCF2FD"></stop>
			<stop offset="1" stopColor="#76B3E1"></stop>
		</linearGradient>
		<linearGradient id="solid_svg__b" x1="92.3" x2="70.5" y1="35" y2="107.6" gradientUnits="userSpaceOnUse">
			<stop stopColor="#76B3E1"></stop>
			<stop offset="0.5" stopColor="#4377BB"></stop>
			<stop offset="1" stopColor="#1F3B77"></stop>
		</linearGradient>
		<linearGradient id="solid_svg__c" x1="14.9" x2="140.8" y1="66.6" y2="152.2" gradientUnits="userSpaceOnUse">
			<stop stopColor="#315AA9"></stop>
			<stop offset="0.5" stopColor="#518AC8"></stop>
			<stop offset="1" stopColor="#315AA9"></stop>
		</linearGradient>
		<linearGradient id="solid_svg__d" x1="71.7" x2="20.9" y1="76.9" y2="263.2" gradientUnits="userSpaceOnUse">
			<stop stopColor="#4377BB"></stop>
			<stop offset="0.5" stopColor="#1A336B"></stop>
			<stop offset="1" stopColor="#1A336B"></stop>
		</linearGradient>
		<path
			fill="#76B3E1"
			d="M159.5 37.4s-53-39-94-30l-3 1c-6 2-11 5-14 9l-2 3-15 26 26 5c11 7 25 10 38 7l46 9 18-30Z"
		></path>
		<path
			fill="url(#solid_svg__a)"
			d="M159.5 37.4s-53-39-94-30l-3 1c-6 2-11 5-14 9l-2 3-15 26 26 5c11 7 25 10 38 7l46 9 18-30Z"
			opacity="0.3"
		></path>
		<path fill="#518AC8" d="m48.5 37.4-4 1c-17 5-22 21-13 35 10 13 31 20 48 15l62-21s-53-39-93-30Z"></path>
		<path
			fill="url(#solid_svg__b)"
			d="m48.5 37.4-4 1c-17 5-22 21-13 35 10 13 31 20 48 15l62-21s-53-39-93-30Z"
			opacity="0.3"
		></path>
		<path
			fill="url(#solid_svg__c)"
			d="M130.5 82.4a45 45 0 0 0-48-15l-62 20-20 35 112 19 20-36c4-7 3-15-2-23Z"
		></path>
		<path
			fill="url(#solid_svg__d)"
			d="M110.5 117.4a45 45 0 0 0-48-15l-62 20s53 40 94 30l3-1c17-5 23-21 13-34Z"
		></path>
	</svg>
)

export default Solid
