define(['app'], function(jForm) {
	
	$('input[name="check-test"]').change(function(e) {
		var checked = $(e.target).prop('checked');
		
		alert( checked + ' ' +$(e.target).val() );
	});
	
	$('input[name="radio-test"]').change(function(e) {
		alert( $(e.target).val() );
	});
	
	
	
	window.jForm = jForm;
	
	
	jForm.set('labelStyle', 'top');
	
	var rows = [];
	
	rows.push({
		name: 'nome',
		labelName: 'Nome',
		default: 'meu nome',
		type: 'text'
	});
	
	rows.push({
		name: 'email',
		labelName: 'e-mail',
		type: 'text'
	});
	
	rows.push({
		name: 'num',
		labelName: 'Campo numérico',
		type: 'text'
	});
	
	rows.push([
		{
			name: 'input-select',
			default: 'third',
			labelName: 'label-tes ddddt',
			type: 'select',
			options: [ 'first', 'second', { label: 'tres!', value: 'third' }]
		},{
			name: 'input-select-2',
			default: 'abacaxi',
			labelName: 'label-tes ddddt',
			type: 'select',
			options: [ 'banana', 'abacaxi', 'uva' ],
			inputCss: {
				backgroundColor: '#fff'
			}
		}
	]);
	
	rows.push([
		{
			name: 'checkblock-test',
			default: ['check-2','check-0'],
			labelName: 'Checkblock test',
			type: 'checkblock',
			options: [ 'check-0', 'check-1', 'check-2'],
			labelL: false
		},
		{
			name: 'radioblock-test',
			default: 'radio-3',
			labelName: 'Radio numbers!',
			type: 'radioblock',
			options: ['radio-2','radio-3','radio-4'],
			labelL: true
		}
	]);

	FORM = $('#playground').jForm(rows);
	
});
