$(document).ready(function() {

    const $datasources_table = $(`#datasources-list`).DataTable({
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
            url: `${http_prefix}/lua/get_datasources.lua`,
            type: 'GET',
            dataSrc: ''
        },
        columns: [
            { data: 'alias' },
            { data: 'scope' },
            { data: 'origin' },
            { data: 'data_retention' },
            {
                targets: -1,
                className: 'text-center',
                data: null,
                render: function() {
                    return (`
                        <a href='edit-datasource-modal' class="badge badge-info">Edit</a>
                        <a href='remove-datasource-modal' class="badge badge-danger">Remove</a>
                    `);
                }
            }
        ]
    });

    $(`#add-datasource-modal form`).submit(function(e) {

        e.preventDefault();
        const data_to_send = serializeFormArrayIntoObject($(this).serializeArray());
        $.post(`${http_prefix}/lua/edit_widgets.lua`, { action: 'add', csrf: add_csrf, JSON: JSON.stringify(data_to_send) }, function (data) {

            add_csrf = data.csrf;

            if (data.success) {
                $datasources_table.ajax.reload();
            }

        });

    });

});
