<template>
	<div class="page_error" id="error_err404">
		<div class="box">
			<h1>404</h1>
			<div class="mm_grid">
				<div class="mm_col_50">
					<h2>超级美眉</h2>
				</div>
				<div class="mm_col_50">
					<h5>一个好玩的服务端</h5>
					<p><a href="http://mm.elins.cn">http://mm.elins.cn</a></p>
				</div>
			</div>
		</div>
		<div class="border"></div>
		<div class="border br2"></div>
	</div>
</template>

<script>
</script>

<style>
	#error_err404 h1 {
		font-size: 10rem;
		line-height: 1;
	}

	#error_err404 .box {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		margin-top: -5rem;
		z-index: 2;
	}

	#error_err404 .mm_grid {
		border-top: 1px solid #e1e4e8;
		padding-top: 0.5rem;
	}

	#error_err404 .border {
		opacity: 0.75;
		width: 25rem;
		height: 25rem;
		border: 3px solid #c5d9f5;
		position: fixed;
		top: 50%;
		left: 50%;
		margin-top: -5rem;
		transform: translate(-50%, -50%) rotate(160deg);
	}

	#error_err404 .br2 {
		border-color: #f5cbc5;
		transform: translate(-50%, -50%) rotate(120deg);
	}
</style>
