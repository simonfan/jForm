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
			default: 'default input value',
			labelName: 'label-tes ddddt',
			type: 'select',
			options: [ 'first', 'second', { label: 'tres!', value: 'third' }]
		},{
			name: 'input-select-2',
			default: 'default eeee value',
			labelName: 'label-tes ddddt',
			type: 'select',
			options: [ 'banana', 'sss' ],
			inputCss: {
				backgroundColor: '#fff'
			}
		}
	]);
	
	rows.push([
		{
			name: 'checkblock-test',
			default: 'check-1',
			labelName: 'Checkblock test',
			type: 'checkblock',
			options: [ 'check-0', 'check-1', 'check-2'],
			labelR: true
		},
		{
			name: 'radioblock-test',
			default: 'radio-3',
			labelName: 'Radio numbers!',
			type: 'radioblock',
			options: ['radio-2','radio-3','radio-4'],
			labelR: false
		}
	]);

	FORM = $('#playground').jForm(rows);
	
});
