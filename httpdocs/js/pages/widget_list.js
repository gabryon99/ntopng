function serializeFormArrayIntoObject(serializedArray) {

    const serialized = {};
    serializedArray.forEach((obj) => {
        serialized[obj.name] = obj.value;
    });

    return serialized;
}

$(document).ready(function() {

    const $widgets_table = $(`#widgets-list`).DataTable({
        lengthChange: false,
        pagingType: 'full_numbers',
        stateSave: true,
        initComplete: function() {

        },
        language: {
            info: i18n.showing_x_to_y_rows,
            search: i18n.search,
            infoFiltered: "",
            paginate: {
                previous: '&lt;',
                next: '&gt;',
                first: '«',
                last: '»'
            }
        },
       ajax: {
            url: `${http_prefix}/lua/get_widgets.lua`,
            type: 'GET',
            dataSrc: ''
        },
        columns: [
            { data: 'name' },
            { data: 'type' },
            {
                data: 'params',
                render: (params) => `<code>${JSON.stringify(params)}</code>`
            },
            {
                data: 'ds_hash',
                render: (ds_hash) => `<a href='#'>${ds_hash}</a>`
            },
            {
                targets: -1,
                className: 'text-center',
                data: null,
                render: function() {
                    return (`
                        <a href='#edit-widget-modal' data-toggle='modal' class="badge badge-info">Edit</a>
                        <a href='#embded-widget-modal' data-toggle='modal' class="badge badge-info">Embeded</a>
                        <a href='#remove-widget-modal' data-toggle='modal' class="badge badge-danger">Remove</a>
                    `);
                }
            }
        ]
    });

    $(`#widgets-list`).on('click', `a[href='#remove-widget-modal']`, function(e) {

        const row_data = $widgets_table.row($(this).parent()).data();
        $(`#remove-widget-button`).off('click').click(function () {

            const data_to_send = { widget_key: row_data.key };

            $.post(`${http_prefix}/lua/edit_widgets.lua`, { action: 'remove', JSON: JSON.stringify(data_to_send), csrf: remove_csrf }, function (data) {

                remove_csrf = data.csrf;

                if (data.success) {
                    $widgets_table.ajax.reload();
                    $(`#remove-widget-modal`).modal('hide');
                }

            });
        });
    });

    $(`#widgets-list`).on('click', `a[href='#edit-widget-modal']`, function(e) {

        const row_data = $widgets_table.row($(this).parent()).data();
        row_data.key_ip = row_data.params.key_ip;
        row_data.key_mac = row_data.params.key_mac;
        row_data.key_asn = row_data.params.key_asn;
        row_data.interface = row_data.params.ifid;

        // fill edit modal input fields
        $('#edit-widget-modal form [name]').each(function(e) {
            $(this).val(row_data[$(this).attr('name')]);
        });

        $(`#edit-widget-modal form`).off('submit').submit(function (e) {

            e.preventDefault();

            const data_to_send = serializeFormArrayIntoObject($(this).serializeArray());
            data_to_send.widget_key = row_data.key;

            console.log(data_to_send);

            $.post(`${http_prefix}/lua/edit_widgets.lua`, { action: 'edit', JSON: JSON.stringify(data_to_send), csrf: edit_csrf }, function (data) {
                edit_csrf = data.csrf;
                if (data.success) {
                    $widgets_table.ajax.reload();
                    $(`#edit-widget-modal`).modal('hide');
                }

            });
        });
    });

    $(`#add-widget-modal form`).submit(function(e) {

        e.preventDefault();
        const data_to_send = serializeFormArrayIntoObject($(this).serializeArray());
        const $form = $(this);

        $.post(`${http_prefix}/lua/edit_widgets.lua`, { action: 'add', csrf: add_csrf, JSON: JSON.stringify(data_to_send) }, function (data) {

            add_csrf = data.csrf;

            if (data.success) {
                $widgets_table.ajax.reload();
                $form[0].reset();
                $(`#add-widget-modal`).modal('hide');
            }

        });

    });

});
