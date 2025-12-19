jQuery(document).on('smart_manager_post_load_grid','#sm_editor_grid', function() {
    if( window.smart_manager.current_selected_dashboard !== 'shop_order' || typeof(window.smart_manager.column_names_batch_update) === 'undefined' ) {
        return;
    }
    let orderNotesCols = ['note_for_customer'];
    orderNotesCols.forEach(orderNotesCol => {
        if(typeof(window.smart_manager.column_names_batch_update['custom/'+orderNotesCol]) !== 'undefined'){
            window.smart_manager.column_names_batch_update['custom/'+orderNotesCol]['actions'] = {...window.smart_manager.batch_update_actions['dropdown'], ...{add_to: _x('add to', 'Bulk Edit option for WooCommerce shop order - order notes', 'smart-manager-for-wp-e-commerce'),remove_from: _x('remove from', 'Bulk Edit option for WooCommerce shop order - order notes', 'smart-manager-for-wp-e-commerce')}};
        }
        ['set_to'].forEach(prop => delete window.smart_manager.column_names_batch_update['custom/'+orderNotesCol]['actions'][prop])
     });
})
